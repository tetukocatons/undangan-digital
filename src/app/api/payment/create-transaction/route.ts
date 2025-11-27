// src/app/api/payment/create-transaction/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import midtransClient from 'midtrans-client';

// Inisialisasi Midtrans Snap API
const snap = new midtransClient.Snap({
    isProduction: false, // Set ke true jika sudah live
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
});

// Detail harga paket
const packageDetails: { [key: string]: { price: number, name: string } } = {
    silver: { price: 99000, name: 'Paket Silver' },
    gold: { price: 149000, name: 'Paket Gold' },
    bronze: { price: 0, name: 'Paket Bronze' }
};

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { invitationId, selectedPackage } = await request.json();

        if (!invitationId || !selectedPackage || !packageDetails[selectedPackage]) {
            return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 });
        }
        
        const amount = packageDetails[selectedPackage].price;

        // Handle paket gratis (Bronze)
        if (amount === 0) {
            await supabase.from('events').update({ 
                package: selectedPackage,
                payment_status: 'success',
                status: 'paid'
            }).eq('id', invitationId);
            return NextResponse.json({ free_package: true });
        }

        // --- PERUBAHAN UTAMA: Cek Transaksi Pending untuk Paket Spesifik ---
        const { data: existingTransaction, error: findError } = await supabase
            .from('transactions')
            .select('order_id, snap_token, created_at, amount')
            .eq('event_id', invitationId)
            .eq('status', 'pending')
            .eq('amount', amount) // Tambahkan pengecekan amount
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (findError) {
            console.error("Error finding existing transaction:", findError);
            throw new Error("Gagal memeriksa transaksi sebelumnya.");
        }
        
        if (existingTransaction) {
            const transactionDate = new Date(existingTransaction.created_at);
            const now = new Date();
            const hoursDiff = (now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60);

            // Gunakan kembali token jika ditemukan dan belum expired (24 jam)
            if (hoursDiff < 24) {
                console.log(`Reusing existing pending transaction for package amount ${amount}: ${existingTransaction.order_id}`);
                return NextResponse.json({ 
                    token: existingTransaction.snap_token, 
                    order_id: existingTransaction.order_id 
                });
            }
        }
        // --- AKHIR PERUBAHAN ---

        // Jika tidak ada transaksi pending yang cocok, lanjutkan membuat yang baru
        const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('event_name, groom_name, bride_name')
            .eq('id', invitationId)
            .single();

        if (eventError || !eventData) {
            return NextResponse.json({ error: 'Undangan tidak ditemukan.' }, { status: 404 });
        }
        
        const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

        const shortInvitationId = invitationId.substring(0, 8);
        const order_id = `ARUMAJA-${shortInvitationId}-${Date.now()}`;
        
        const parameter = {
            transaction_details: {
                order_id: order_id,
                gross_amount: amount
            },
            item_details: [{
                id: selectedPackage,
                price: amount,
                quantity: 1,
                name: `${packageDetails[selectedPackage].name} untuk ${eventData.event_name}`,
                merchant_name: "Arumaja"
            }],
            customer_details: {
                first_name: profileData?.full_name || `${eventData.groom_name} & ${eventData.bride_name}`,
                email: user.email,
            },
            callbacks: {
              finish: `${new URL(request.url).origin}/dashboard`
            }
        };

        const token = await snap.createTransactionToken(parameter);

        const { error: transactionInsertError } = await supabase
            .from('transactions')
            .insert({
                order_id: order_id,
                event_id: invitationId,
                user_id: user.id,
                amount: amount,
                status: 'pending',
                snap_token: token,
            });

        if (transactionInsertError) {
            throw new Error(`Gagal membuat catatan transaksi: ${transactionInsertError.message}`);
        }

        const { error: eventUpdateError } = await supabase
            .from('events')
            .update({ 
                package: selectedPackage,
                payment_status: 'pending'
            })
            .eq('id', invitationId);
            
        if (eventUpdateError) {
             return NextResponse.json({ error: `Gagal update event: ${eventUpdateError.message}` }, { status: 500 });
        }

        return NextResponse.json({ token, order_id });

    } catch (error: any) {
        if (error.isMidtransError) {
             console.error('Midtrans API Error:', error.message);
             return NextResponse.json({ error: error.message, isMidtransError: true }, { status: error.httpStatusCode });
        }
        console.error('Internal Server Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}