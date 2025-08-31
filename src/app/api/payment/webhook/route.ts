// src/app/api/payment/webhook/routes.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Import createClient standar
import Midtrans from 'midtrans-client';

// Inisialisasi Midtrans Snap API
const snap = new Midtrans.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

// PENTING: Buat client Supabase khusus dengan Service Role Key
// Ini akan digunakan untuk semua operasi database di dalam webhook ini
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Gunakan Service Role Key di sini
);

export async function POST(request: Request) {
  try {
    const notificationJson = await request.json();

    // 1. Verifikasi notifikasi dari Midtrans untuk keamanan
    const statusResponse = await snap.transaction.notification(notificationJson);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    // 2. Cari transaksi di DATABASE Anda berdasarkan order_id
    // Gunakan supabaseAdmin yang punya hak akses penuh
    const { data: transaction, error: findError } = await supabaseAdmin
      .from('transactions') // Pastikan Anda sudah membuat tabel 'transactions'
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (findError || !transaction) {
      console.error(`Webhook Error: Transaksi dengan order_id ${orderId} tidak ditemukan.`);
      return NextResponse.json({ status: 'error', message: 'Transaction not found' }, { status: 404 });
    }

    // 3. Hindari memproses notifikasi yang sama berulang kali (Idempotency)
    if (transaction.status === 'success' || transaction.status === 'failed') {
      return NextResponse.json({ status: 'ok', message: 'Transaction already processed' }, { status: 200 });
    }

    // 4. Tentukan status baru berdasarkan notifikasi
    let newStatus = transaction.status;
    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept') {
        newStatus = 'success';
      }
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      newStatus = 'failed';
    }

    // 5. Update status transaksi di database Anda
    const { error: updateError } = await supabaseAdmin
      .from('transactions')
      .update({
        status: newStatus,
        payment_gateway_response: notificationJson,
      })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Webhook DB Error: Gagal update status transaksi.', updateError);
      return NextResponse.json({ status: 'error', message: 'Failed to update transaction' }, { status: 500 });
    }

    // 6. Jika pembayaran sukses, update juga status undangan/event terkait
    if (newStatus === 'success' && transaction.event_id) {
      const { error: eventUpdateError } = await supabaseAdmin
        .from('events')
        .update({ status: 'published' }) // atau status lain yang sesuai
        .eq('id', transaction.event_id);

      if (eventUpdateError) {
        console.error('Webhook DB Error: Gagal update status event.', eventUpdateError);
        // Tetap kembalikan 200 ke Midtrans, tapi error ini perlu dicatat
      }
    }

    // 7. Kirim respons 200 OK ke Midtrans
    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('Webhook Processing Error:', error);
    return NextResponse.json({ status: 'error', message: (error as Error).message }, { status: 500 });
  }
}