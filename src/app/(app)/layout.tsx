// src/app/(app)/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Dengan membungkus grup (app) dengan AuthProvider,
  // state otentikasi hanya aktif di area dashboard dan terisolasi
  // dari halaman publik.
  return <AuthProvider>{children}</AuthProvider>;
}