-- ClaimIT Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('student', 'staff', 'teacher', 'admin')) NOT NULL,
    address TEXT,
    mobile_number TEXT,
    school_id_number TEXT,
    department TEXT,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create items table
CREATE TABLE IF NOT EXISTS public.items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    date_lost_found DATE NOT NULL,
    image_url TEXT,
    status TEXT CHECK (status IN ('active', 'claimed', 'archived')) DEFAULT 'active',
    item_type TEXT CHECK (item_type IN ('lost', 'found')) NOT NULL,
    posted_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    qr_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create claims table
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
    claimant_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    proof_image_url TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
    claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_posted_by ON public.items(posted_by);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_item_type ON public.items(item_type);
CREATE INDEX IF NOT EXISTS idx_claims_item_id ON public.claims(item_id);
CREATE INDEX IF NOT EXISTS idx_claims_claimant_id ON public.claims(claimant_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_items_updated_at
    BEFORE UPDATE ON public.items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_claims_updated_at
    BEFORE UPDATE ON public.claims
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can read their own profile and basic info of others
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view basic info of others" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Items policies
CREATE POLICY "Anyone can view active items" ON public.items
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create items" ON public.items
    FOR INSERT WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "Users can update own items" ON public.items
    FOR UPDATE USING (auth.uid() = posted_by);

CREATE POLICY "Admins can update any item" ON public.items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Claims policies
CREATE POLICY "Users can view claims for their items" ON public.claims
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.items 
            WHERE id = item_id AND posted_by = auth.uid()
        )
    );

CREATE POLICY "Users can view their own claims" ON public.claims
    FOR SELECT USING (auth.uid() = claimant_id);

CREATE POLICY "Users can create claims" ON public.claims
    FOR INSERT WITH CHECK (auth.uid() = claimant_id);

CREATE POLICY "Item owners can update claims" ON public.claims
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.items 
            WHERE id = item_id AND posted_by = auth.uid()
        )
    );

-- Messages policies
CREATE POLICY "Users can view their messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Insert some sample data for testing
INSERT INTO public.users (id, email, full_name, role, points) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'admin@claimit.com', 'Admin User', 'admin', 100),
    ('550e8400-e29b-41d4-a716-446655440001', 'student@claimit.com', 'John Doe', 'student', 50),
    ('550e8400-e29b-41d4-a716-446655440002', 'teacher@claimit.com', 'Jane Smith', 'teacher', 75)
ON CONFLICT (id) DO NOTHING;

-- Sample items
INSERT INTO public.items (title, description, category, location, date_lost_found, item_type, posted_by, status) VALUES
    ('Lost iPhone 13', 'Blue iPhone 13 with clear case', 'Electronics', 'Library 2nd Floor', '2025-09-28', 'lost', '550e8400-e29b-41d4-a716-446655440001', 'active'),
    ('Found Wallet', 'Brown leather wallet found near cafeteria', 'Personal Items', 'Cafeteria', '2025-09-29', 'found', '550e8400-e29b-41d4-a716-446655440002', 'active'),
    ('Lost Car Keys', 'Toyota car keys with red keychain', 'Keys', 'Parking Lot A', '2025-09-27', 'lost', '550e8400-e29b-41d4-a716-446655440001', 'active')
ON CONFLICT DO NOTHING;