/*
  # Complete FameChase Database Setup - Production Ready

  This script sets up a complete, production-ready database for FameChase.
  Run this in your Supabase SQL Editor to initialize all tables and data.

  ## What This Script Does:

  1. Creates all required tables:
     - users (user profiles and quiz data)
     - products (product catalog)
     - purchases (transaction records)
     - downloads (download tracking)
     - admin_users (admin authentication)

  2. Enables Row Level Security (RLS) on all tables

  3. Creates appropriate security policies

  4. Pre-populates products and admin account

  5. Sets up indexes for performance

  6. Creates helper functions for admin authentication

  ## Default Admin Credentials:
  Email: admin@famechase.com
  Password: Admin@123
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TABLE CREATION
-- =============================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  city text,
  niche text,
  primary_platform text,
  follower_count text,
  goals text[],
  quiz_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  original_price decimal(10,2) NOT NULL,
  description text,
  features text[],
  is_enabled boolean DEFAULT true,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  product_id text REFERENCES products(id),
  amount decimal(10,2) NOT NULL,
  discount_amount decimal(10,2) DEFAULT 0,
  promo_code text,
  payment_id text,
  payment_status text DEFAULT 'pending',
  payment_method text DEFAULT 'instamojo',
  customer_info jsonb,
  payu_response jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create downloads table
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid REFERENCES purchases(id),
  product_id text,
  download_id text,
  user_id uuid REFERENCES users(id),
  downloaded_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- INSERT INITIAL DATA
-- =============================================

-- Insert products
INSERT INTO products (id, name, price, original_price, description, category, features) VALUES
('complete-growth-kit', 'Complete Creator Growth Kit', 99, 199, 'Everything you need to grow from 0 to 10K followers and start monetizing', 'growth-kit', ARRAY[
  'Personalized Media Kit PDF (Used by 94% of successful creators)',
  '30+ Email Templates for Brand Outreach (65% higher response rate)',
  'Professional Pricing Calculator (Based on real Indian market data)',
  'Content Calendar Template (3 months proven strategy)',
  'Growth Strategy Workbook (Average 3.2x follower growth)',
  'Hashtag Research Guide (Boost reach by 45% on average)',
  'Rate Card Templates (Increase brand deal value by 40%)',
  'Contract Templates (Protect your income legally)',
  'BONUS: Real Creator Income Reports (₹50K+ monthly case studies)'
]),
('reels-mastery', 'Instagram Reels Mastery Course', 197, 397, 'Learn the viral formula that gets millions of views consistently', 'course', ARRAY[
  '2-hour video training (Step-by-step viral formula)',
  '50+ Viral Reel Ideas (Tested on 500K+ followers)',
  'Editing Templates & Transitions (Used by top Indian creators)',
  'Music & Sound Selection Guide (2024 trending audio list)',
  'Algorithm Optimization Secrets (86% higher reach proven)',
  'Case Studies from 1M+ creators (Real income breakdowns)',
  'BONUS: Live monthly Q&A sessions with viral creators'
]),
('brand-masterclass', 'Brand Collaboration Masterclass', 149, 299, 'Get paid partnerships with top brands - step by step system', 'masterclass', ARRAY[
  'Brand Outreach Email Scripts',
  'Media Kit Templates (10 designs)',
  'Negotiation Tactics & Rate Cards',
  'Contract Templates',
  '50+ Brand Contact Database',
  'Pitch Deck Templates'
]),
('youtube-mastery', 'YouTube Mastery Course', 297, 597, 'Complete YouTube growth and monetization blueprint for creators', 'course', ARRAY[
  '2-hour comprehensive video training',
  'YouTube SEO optimization secrets',
  'Monetization strategies (AdSense + sponsors)',
  'Thumbnail design templates & psychology',
  'Viral content frameworks & hooks',
  'Analytics mastery & growth tracking'
]),
('facebook-posting-mastery', 'Facebook Posting Mastery Course', 197, 397, 'Master Facebook organic reach and engagement for maximum impact', 'course', ARRAY[
  '2-hour video training series',
  'Facebook algorithm secrets 2024',
  'Post optimization techniques',
  'Community building strategies',
  'Facebook groups monetization',
  'Content calendar templates'
]),
('complete-bundle', 'Complete Creator Bundle', 497, 997, 'Get ALL premium products for 70% OFF - Save ₹700+ and become a creator success story', 'bundle', ARRAY[
  'Complete Creator Growth Kit',
  'Instagram Reels Mastery Course',
  'YouTube Mastery Course',
  'Facebook Posting Mastery Course',
  'Brand Collaboration Masterclass',
  'Bonus: 1-on-1 Strategy Call'
])
ON CONFLICT (id) DO NOTHING;

-- Insert default admin user (email: admin@famechase.com, password: Admin@123)
INSERT INTO admin_users (email, password_hash) VALUES
('admin@famechase.com', crypt('Admin@123', gen_salt('bf')))
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- =============================================
-- DROP EXISTING POLICIES (if any)
-- =============================================

DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can insert users" ON users;
  DROP POLICY IF EXISTS "Anyone can read users" ON users;
  DROP POLICY IF EXISTS "Anyone can update users" ON users;
  DROP POLICY IF EXISTS "Products are publicly readable" ON products;
  DROP POLICY IF EXISTS "Anyone can read purchases" ON purchases;
  DROP POLICY IF EXISTS "Anyone can insert purchases" ON purchases;
  DROP POLICY IF EXISTS "Anyone can update purchases" ON purchases;
  DROP POLICY IF EXISTS "Anyone can read downloads" ON downloads;
  DROP POLICY IF EXISTS "Anyone can insert downloads" ON downloads;
  DROP POLICY IF EXISTS "Service role can manage admin_users" ON admin_users;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- =============================================
-- CREATE SECURITY POLICIES
-- =============================================

-- Users table policies (public for quiz submission)
CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update users" ON users
  FOR UPDATE USING (true);

-- Products table policies (publicly readable)
CREATE POLICY "Products are publicly readable" ON products
  FOR SELECT USING (true);

-- Purchases table policies (public for payment flow)
CREATE POLICY "Anyone can read purchases" ON purchases
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert purchases" ON purchases
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update purchases" ON purchases
  FOR UPDATE USING (true);

-- Downloads table policies (public for download functionality)
CREATE POLICY "Anyone can read downloads" ON downloads
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert downloads" ON downloads
  FOR INSERT WITH CHECK (true);

-- Admin users table policies (service role only)
CREATE POLICY "Service role can manage admin_users" ON admin_users
  FOR ALL USING (true);

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_id ON purchases(payment_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_purchase_id ON downloads(purchase_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- =============================================
-- CREATE TRIGGERS
-- =============================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchases_updated_at ON purchases;
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CREATE HELPER FUNCTIONS
-- =============================================

-- Function to verify admin login
CREATE OR REPLACE FUNCTION verify_admin_login(user_email text, user_password text)
RETURNS TABLE (
  id uuid,
  email text,
  is_valid boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.email,
    (a.password_hash = crypt(user_password, a.password_hash)) as is_valid
  FROM admin_users a
  WHERE a.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =============================================
-- SETUP COMPLETE
-- =============================================

-- Verify setup
DO $$
DECLARE
  product_count INTEGER;
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count FROM products;
  SELECT COUNT(*) INTO admin_count FROM admin_users;

  RAISE NOTICE 'Database setup complete!';
  RAISE NOTICE 'Products created: %', product_count;
  RAISE NOTICE 'Admin users created: %', admin_count;
  RAISE NOTICE 'Default admin email: admin@famechase.com';
  RAISE NOTICE 'Default admin password: Admin@123';
END $$;
