-- Fix the trigger and manually create missing user profiles
-- Run this SQL in your Supabase SQL Editor

-- First, let's check if the trigger function exists and is working
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- Check if the trigger exists
SELECT tgname, tgrelid::regclass, tgfoid::regproc 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Let's recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the trigger execution for debugging
  RAISE LOG 'handle_new_user trigger called for user: %', NEW.id;
  RAISE LOG 'User metadata: %', NEW.raw_user_meta_data;
  
  -- Insert the user profile
  INSERT INTO public.users (id, email, full_name, role, school_id_number, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'school_id_number',
    NEW.raw_user_meta_data->>'department'
  );
  
  RAISE LOG 'User profile created successfully for: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW; -- Don't fail the auth user creation if profile creation fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Now let's manually create profiles for existing auth users who don't have profiles
INSERT INTO public.users (id, email, full_name, role, school_id_number, department)
SELECT 
    a.id,
    a.email,
    COALESCE(a.raw_user_meta_data->>'full_name', a.email) as full_name,
    COALESCE(a.raw_user_meta_data->>'role', 'student') as role,
    a.raw_user_meta_data->>'school_id_number' as school_id_number,
    a.raw_user_meta_data->>'department' as department
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.id
WHERE p.id IS NULL
  AND a.email_confirmed_at IS NOT NULL; -- Only confirmed users

-- Check the results
SELECT 
    'Users in auth.users' as table_name,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Users in public.users' as table_name,
    COUNT(*) as count
FROM public.users;

-- Show any remaining mismatches
SELECT 
    a.id,
    a.email,
    a.raw_user_meta_data,
    CASE 
        WHEN p.id IS NULL THEN 'Missing from public.users'
        ELSE 'Profile exists'
    END as status
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.id
ORDER BY a.created_at DESC;