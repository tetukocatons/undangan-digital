-- 1. Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'customer'
);
COMMENT ON TABLE public.profiles IS 'Stores public profile data for each user.';

-- 2. Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile for a new user.';

-- 3. Change ownership of the function to the Supabase auth admin
ALTER FUNCTION public.handle_new_user() OWNER TO supabase_auth_admin;

-- 4. Create the trigger that calls the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Fires the handle_new_user function upon new user registration.';