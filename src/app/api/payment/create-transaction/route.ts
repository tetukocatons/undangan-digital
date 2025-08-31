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

        // === PERBAIKAN UTAMA DI SINI ===
        // Memperpendek `order_id` agar tidak lebih dari 50 karakter
        const shortInvitationId = invitationId.substring(0, 8); // Ambil 8 karakter pertama dari UUID
        const order_id = `ARUMAJA-${shortInvitationId}-${Date.now()}`; // Total panjang sekarang ~30 karakter
        // === AKHIR PERBAIKAN ===
        
        const amount = packageDetails[selectedPackage].price;

        if (amount === 0) {
            await supabase.from('events').update({ 
                package: selectedPackage,
                payment_status: 'success',
                status: 'published'
            }).eq('id', invitationId);
            return NextResponse.json({ free_package: true });
        }

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
        // Tangkap error dari Midtrans dan kembalikan pesannya ke frontend
        if (error.isMidtransError) {
             console.error('Midtrans API Error:', error.message);
             return NextResponse.json({ error: error.message, isMidtransError: true }, { status: error.httpStatusCode });
        }
        console.error('Internal Server Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}