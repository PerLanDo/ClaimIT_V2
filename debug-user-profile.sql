-- Debug and fix user profile loading issue
-- Run this SQL in your Supabase SQL Editor

-- First, let's check what users exist in auth.users vs public.users
SELECT 
    'auth.users' as table_name,
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Check what's in public.users
SELECT 
    'public.users' as table_name,
    id,
    email,
    full_name,
    role,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 5;

-- Find users who exist in auth but not in public.users
SELECT 
    a.id,
    a.email,
    a.raw_user_meta_data,
    CASE 
        WHEN p.id IS NULL THEN 'Missing from public.users'
        ELSE 'Exists in public.users'
    END as status
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.id
ORDER BY a.created_at DESC;

-- If there are missing users, let's manually create them
-- (Replace the values below with your actual user data from the auth.users query above)
/*
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
WHERE p.id IS NULL;
*/