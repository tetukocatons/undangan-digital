/**
 * src/lib/types.ts
 * * File terpusat untuk semua definisi tipe TypeScript berdasarkan skema database Anda.
 * Ini membantu menjaga konsistensi di seluruh aplikasi.
 */

// --- Tipe Utama dari Tabel 'profiles' ---
export type UserProfile = {
  id: string;
  full_name: string;
  role: string; // 'customer', 'staff', 'administrator'
};

// --- Tipe Utama dari Tabel 'events' ---
export type Invitation = {
  id: string;
  user_id: string;
  created_at: string;
  event_name: string;
  event_date: string;
  status: 'draft' | 'paid' | 'expired';
  slug: string;
  package: string;
  theme_id: string | null;
  bride_name: string;
  groom_name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  
  // Fitur (dari skema & FeatureManagement.tsx)
  couple_enabled: boolean;
  story_enabled: boolean; // Ini adalah 'quotes_enabled' yang kita rename
  gallery_enabled: boolean;
  acara_enabled: boolean;
  gift_enabled: boolean; 
  
  // Detail Pembayaran & Status
  payment_status: string; // 'pending', 'success', 'failed'
  order_id: string | null; // Sepertinya ini merujuk ke 'order_id' terakhir?
  valid_to: string | null; // Digunakan di InvitationsView
  last_completed_step: number | null;
  
  // (Kolom yang belum ada di tipe Anda tapi ada di skema)
  // Anda bisa menambahkannya jika perlu
  // event_data: any | null; 
  // swipe_mode_enabled: boolean;
  // opening_enabled: boolean;
};

// --- Tipe dari Tabel 'guests' ---
export type GuestRsvpStatus = 'Pending' | 'Confirmed' | 'Declined';

export type Guest = {
  id: string; // uuid di skema
  event_id: string;
  name: string;
  phone: string | null;
  rsvp_status: GuestRsvpStatus;
  attendance_count: number;
  qr_code_id: string | null;
  created_at: string;
};

// --- Tipe dari Tabel 'transactions' ---
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'capture' | 'settlement' | 'cancel' | 'deny' | 'expire';

export type Transaction = {
  id: number; // bigint di skema
  order_id: string;
  event_id: string;
  user_id: string;
  amount: number;
  status: TransactionStatus | string;
  snap_token: string | null;
  payment_gateway_response: any | null; // jsonb
  created_at: string;
  updated_at: string;
};

// --- Tipe dari Tabel 'digital_gifts' ---
export type DigitalGift = {
  id: number; // bigint di skema
  event_id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  qr_code_url: string | null;
  created_at: string;
  updated_at: string;
};

// --- Tipe dari Tabel 'themes' ---
export type Theme = {
  id: string; // uuid
  name: string;
  preview_url?: string | null; // Digunakan di ThemeSelector, tambahkan ke skema jika perlu
  is_public: boolean;
  created_at: string;
};

// --- Tipe dari Tabel 'packages' ---
export type Package = {
  id: string; // uuid
  name: string;
  price: number;
  validity_days: number;
  features: any | null; // jsonb
  is_active: boolean;
};