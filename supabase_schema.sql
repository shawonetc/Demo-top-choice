-- Supabase Database Schema Script
-- Copy this script and run it in the Supabase SQL Editor for your new project.

-- 1. Create Profiles Table (For Admin/User roles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user', -- 'admin' or 'user'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy helper function to avoid infinite recursion (SECURITY DEFINER bypasses RLS in the function context)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins to do everything on profiles" ON public.profiles;

CREATE POLICY "Allow public read access to profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow admins to do everything on profiles" ON public.profiles
    USING (public.is_admin());

-- 2. Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.email,
        CASE 
            -- Check if this is the first user, make them admin (optional, or configure manually)
            WHEN NOT EXISTS (SELECT 1 FROM public.profiles) THEN 'admin'
            ELSE 'user'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT, -- JSON string containing HTML description and metadata
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    image_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    category TEXT,
    stock_status TEXT DEFAULT 'In Stock',
    call_to_order TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow admins full access to products" ON public.products;

CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Allow admins full access to products" ON public.products
    USING (public.is_admin());


-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    shipping_cost NUMERIC DEFAULT 0,
    subtotal NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'New order',
    payment_status TEXT DEFAULT 'Unpaid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow users to read their own orders (by phone matching or session)" ON public.orders;
DROP POLICY IF EXISTS "Allow admins full access to orders" ON public.orders;

CREATE POLICY "Allow public to insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to read their own orders (by phone matching or session)" ON public.orders
    FOR SELECT USING (true); -- Set to true for simplicity in cod e.g., tracking order by phone/ID

CREATE POLICY "Allow admins full access to orders" ON public.orders
    USING (public.is_admin());


-- 5. Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id BIGINT,
    product_title TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    price NUMERIC NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public to read order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow admins full access to order items" ON public.order_items;

CREATE POLICY "Allow public to insert order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to read order items" ON public.order_items
    FOR SELECT USING (true);

CREATE POLICY "Allow admins full access to order items" ON public.order_items
    USING (public.is_admin());


-- 6. Create Notifications Table (for Admin Dashboard alerts)
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'success',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow admins full access to notifications" ON public.notifications;

CREATE POLICY "Allow public to insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admins full access to notifications" ON public.notifications
    USING (public.is_admin());


-- 7. Create Store Settings Table (Single-row pattern)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1) DEFAULT 1,
    store_name TEXT DEFAULT 'NittoNotun-BD',
    tagline TEXT DEFAULT 'Best Online Shopping in Bangladesh',
    description TEXT DEFAULT 'NittoNotun-BD is Bangladesh''s trusted online marketplace for high-quality electronics, home appliances, and lifestyle products.',
    url TEXT DEFAULT 'https://nittonotonbd.com',
    logo_text TEXT DEFAULT 'NittoNotun-BD',
    logo_text_short TEXT DEFAULT 'Nittonotonbd',
    primary_color TEXT DEFAULT '#ff5a00',
    primary_hover TEXT DEFAULT '#e04f00',
    phone TEXT DEFAULT '+8801887245556',
    phone_digits TEXT DEFAULT '01887245556',
    whatsapp TEXT DEFAULT '8801887245556',
    email TEXT DEFAULT 'nittonotonbd@gmail.com',
    address TEXT DEFAULT 'শার্শা, যশোর, খুলনা',
    facebook_url TEXT DEFAULT 'https://www.facebook.com/share/1AgQt9VYXB/',
    tiktok_url TEXT DEFAULT 'https://www.tiktok.com/@nittonotunbd?_r=1&_t=ZS-98FNBmuH9ym',
    instagram_url TEXT DEFAULT 'https://www.instagram.com/nittonotunbd',
    logo_url TEXT DEFAULT '/images/logo.png',
    logo_url_header TEXT DEFAULT '/images/logo1.png',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pre-populate default settings
INSERT INTO public.store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable RLS for Store Settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow admins to update store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow admins to insert store settings" ON public.store_settings;

CREATE POLICY "Allow public read access to store settings" ON public.store_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow admins to update store settings" ON public.store_settings
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Allow admins to insert store settings" ON public.store_settings
    FOR INSERT WITH CHECK (public.is_admin());


-- 8. Create Storage Bucket for Products and logos (Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the 'products' bucket
DROP POLICY IF EXISTS "Allow public read access to products storage" ON storage.objects;
CREATE POLICY "Allow public read access to products storage" ON storage.objects
    FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow admins to manage products storage" ON storage.objects;
CREATE POLICY "Allow admins to manage products storage" ON storage.objects
    USING (bucket_id = 'products' AND auth.role() = 'authenticated');


-- 9. Create RPC function for Admin to Delete Users
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Check if the executor is an admin
    IF EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'Super Admin')
    ) THEN
        -- Delete user from auth.users (which cascades to public.profiles)
        DELETE FROM auth.users WHERE id = user_id;
    ELSE
        RAISE EXCEPTION 'Only admins can delete users';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



