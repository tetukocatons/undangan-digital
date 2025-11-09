// src/app/api/payment/webhook/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import midtransClient from 'midtrans-client';
import { createHash } from 'crypto'; // <-- 1. Import crypto

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- 2. Fungsi untuk validasi signature ---
function validateSignature(orderId: string, statusCode: string, grossAmount: string, signatureKey: string) {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
        console.error('Webhook Error: MIDTRANS_SERVER_KEY is not set.');
        return false;
    }
    
    const hash = createHash('sha512');
    const dataToHash = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const calculatedSignature = hash.update(dataToHash).digest('hex');
    
    return calculatedSignature === signatureKey;
}

export async function POST(request: Request) {
  try {
    const notificationJson = await request.json();

    // --- 3. Lakukan validasi signature SEGERA ---
    const { 
        order_id: orderId, 
        transaction_status: transactionStatus, 
        fraud_status: fraudStatus,
        gross_amount: grossAmount,
        status_code: statusCode,
        signature_key: signatureKey
    } = notificationJson;

    if (!orderId || !statusCode || !grossAmount || !signatureKey) {
        return NextResponse.json({ status: 'error', message: 'Invalid notification data' }, { status: 400 });
    }

    const isValid = validateSignature(orderId, statusCode, grossAmount, signatureKey);
    
    if (!isValid) {
        console.warn(`Webhook Warning: Invalid signature for order_id ${orderId}.`);
        return NextResponse.json({ status: 'error', message: 'Invalid signature' }, { status: 403 });
    }
    // --- Akhir dari validasi signature ---


    const { data: transaction, error: findError } = await supabaseAdmin
      .from('transactions')
      .select('status, amount')
      .eq('order_id', orderId)
      .single();

    if (findError || !transaction) {
      console.error(`Webhook Error: Transaction with order_id ${orderId} not found.`);
      return NextResponse.json({ status: 'error', message: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.amount !== parseInt(grossAmount)) {
        console.error(`Webhook Error: Amount mismatch for order_id ${orderId}. DB: ${transaction.amount}, Midtrans: ${grossAmount}`);
        return NextResponse.json({ status: 'error', message: 'Invalid amount' }, { status: 400 });
    }

    if (transaction.status === 'success') {
      return NextResponse.json({ status: 'ok', message: 'Transaction already processed as success' }, { status: 200 });
    }

    // Gunakan transactionStatus dan fraudStatus dari data yang divalidasi
    if ((transactionStatus === 'capture' || transactionStatus === 'settlement') && fraudStatus === 'accept') {
      const { error: rpcError } = await supabaseAdmin.rpc('handle_successful_payment', {
        order_id_param: orderId
      });

      if (rpcError) {
        console.error('Webhook DB Error: Failed while calling RPC handle_successful_payment.', rpcError);
        return NextResponse.json({ status: 'error', message: 'Failed to execute RPC function' }, { status: 500 });
      }

    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'failed', payment_gateway_response: notificationJson })
        .eq('order_id', orderId);
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('Webhook Processing Error:', error);
    return NextResponse.json({ status: 'error', message: (error as Error).message }, { status: 500 });
  }
}