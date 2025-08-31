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

// Detail harga paket (sebaiknya ini dari database atau config terpusat)
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

        const order_id = `ARUMAJA-${invitationId}-${Date.now()}`;
        const amount = packageDetails[selectedPackage].price;

        // Jangan buat transaksi jika paketnya gratis
        if (amount === 0) {
            // Langsung update status undangan
            await supabase.from('events').update({ 
                package: selectedPackage,
                payment_status: 'success',
                status: 'published' // Langsung publish
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

        // Simpan order_id dan status pembayaran ke database
        const { error: updateError } = await supabase
            .from('events')
            .update({ 
                order_id: order_id, 
                payment_status: 'pending',
                package: selectedPackage
            })
            .eq('id', invitationId);

        if (updateError) {
             return NextResponse.json({ error: `Gagal menyimpan Order ID: ${updateError.message}` }, { status: 500 });
        }

        return NextResponse.json({ token, order_id });

    } catch (error: any) {
        console.error('Error creating transaction:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}