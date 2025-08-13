-- Mengamankan fungsi dengan menetapkan search_path secara eksplisit
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Mengatur ulang kepemilikan fungsi ke admin auth Supabase, untuk memastikan konsistensi
ALTER FUNCTION public.handle_new_user() OWNER TO supabase_auth_admin;