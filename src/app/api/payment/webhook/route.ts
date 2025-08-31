// src/app/api/payment/webhook/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import midtransClient from 'midtrans-client';

// Inisialisasi Midtrans Snap API
const snap = new midtransClient.Snap({
  isProduction: false, // Ganti ke true saat production
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

// PENTING: Gunakan Supabase client dengan Service Role Key untuk akses penuh di backend
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const notificationJson = await request.json();

    // 1. Verifikasi notifikasi dari Midtrans untuk keamanan
    const statusResponse = await snap.transaction.notification(notificationJson);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const grossAmount = statusResponse.gross_amount;

    // === PERBAIKAN UTAMA ===
    // 2. Cari transaksi di tabel 'transactions' berdasarkan order_id
    const { data: transaction, error: findError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (findError || !transaction) {
      console.error(`Webhook Error: Transaksi dengan order_id ${orderId} tidak ditemukan.`);
      return NextResponse.json({ status: 'error', message: 'Transaction not found' }, { status: 404 });
    }
    
    // Pengecekan tambahan untuk keamanan: validasi nominal transaksi
    if (transaction.amount !== parseInt(grossAmount)) {
        console.error(`Webhook Error: Amount mismatch untuk order_id ${orderId}. DB: ${transaction.amount}, Midtrans: ${grossAmount}`);
        return NextResponse.json({ status: 'error', message: 'Invalid amount' }, { status: 400 });
    }

    // 3. Hindari memproses notifikasi yang sama berulang kali (Idempotency)
    if (transaction.status === 'success' || transaction.status === 'failed') {
      return NextResponse.json({ status: 'ok', message: 'Transaction already processed' }, { status: 200 });
    }

    // 4. Tentukan status baru berdasarkan notifikasi Midtrans
    let newStatus: 'pending' | 'success' | 'failed' = transaction.status as any;
    let newPaymentStatus: 'pending' | 'success' | 'failed' = 'pending';
    let newEventStatus: 'draft' | 'published' = 'draft';

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept') {
        newStatus = 'success';
        newPaymentStatus = 'success';
        newEventStatus = 'published';
      }
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      newStatus = 'failed';
      newPaymentStatus = 'failed';
    }

    // 5. Update status di tabel 'transactions'
    const { error: updateError } = await supabaseAdmin
      .from('transactions')
      .update({
        status: newStatus,
        payment_gateway_response: notificationJson, // Simpan seluruh payload untuk audit
      })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Webhook DB Error: Gagal update status transaksi.', updateError);
      return NextResponse.json({ status: 'error', message: 'Failed to update transaction' }, { status: 500 });
    }

    // 6. Jika pembayaran sukses, update juga tabel 'events' terkait
    if (newStatus === 'success' && transaction.event_id) {
      const { error: eventUpdateError } = await supabaseAdmin
        .from('events')
        .update({ 
            payment_status: newPaymentStatus,
            status: newEventStatus 
        })
        .eq('id', transaction.event_id);

      if (eventUpdateError) {
        console.error('Webhook DB Error: Gagal update status event.', eventUpdateError);
        // Tetap kembalikan 200 ke Midtrans, tapi catat error ini untuk investigasi
      }
    }

    // 7. Kirim respons 200 OK ke Midtrans untuk mengonfirmasi penerimaan notifikasi
    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('Webhook Processing Error:', error);
    return NextResponse.json({ status: 'error', message: (error as Error).message }, { status: 500 });
  }
}