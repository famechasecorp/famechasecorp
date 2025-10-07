-- FameChase Database Setup Script
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for quiz data and user profiles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  city TEXT,
  niche TEXT,
  primary_platform TEXT,
  follower_count TEXT,
  goals TEXT[],
  quiz_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  description TEXT,
  features TEXT[],
  is_enabled BOOLEAN DEFAULT true,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  product_id TEXT REFERENCES products(id),
  amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  promo_code TEXT,
  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'payu',
  customer_info JSONB,
  payu_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create downloads table to track product downloads
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES purchases(id),
  product_id TEXT,
  download_id TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id)
);

-- Insert initial products
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for products (publicly readable)
CREATE POLICY "Products are publicly readable" ON products
  FOR SELECT USING (true);

-- Create policies for purchases
CREATE POLICY "Users can view their own purchases" ON purchases
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own purchases" ON purchases
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can update purchases" ON purchases
  FOR UPDATE USING (auth.role() = 'service_role');

-- Create policies for downloads
CREATE POLICY "Users can view their own downloads" ON downloads
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own downloads" ON downloads
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_id ON purchases(payment_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_purchase_id ON downloads(purchase_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create admin user function (optional)
CREATE OR REPLACE FUNCTION create_admin_user(user_email TEXT, user_password TEXT)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- This would need to be called from the Supabase dashboard or via the management API
    -- as user creation requires admin privileges
    RAISE NOTICE 'Admin user creation should be done via Supabase Auth dashboard';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON users, purchases, downloads TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert some sample data for testing (optional)
-- INSERT INTO users (id, name, email, niche, primary_platform) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'Test User', 'test@example.com', 'Technology', 'Instagram')
-- ON CONFLICT (id) DO NOTHING;
