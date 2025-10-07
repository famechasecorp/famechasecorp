# Supabase Database Setup Instructions

## Step 1: Run the SQL Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `lqjfyogttlsubccnllyd`
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the entire SQL script from `scripts/setup-database-complete.sql`
6. Click "Run" or press Ctrl+Enter

## Step 2: Verify the Setup

After running the migration, verify that the following tables were created:

- `users` - User profiles and quiz data
- `products` - Product catalog (should have 6 products pre-populated)
- `purchases` - Purchase records
- `downloads` - Download tracking
- `admin_users` - Admin authentication (default admin created)

## Step 3: Admin Credentials

The following admin account has been created for you:

**Email:** admin@famechase.com
**Password:** Admin@123

You can log in at: https://your-domain.com/admin-login

## Step 4: How It Works

### Payment Flow
1. User completes quiz
2. User browses products at `/shop`
3. User clicks "Buy Now"
4. Payment redirects to Instamojo: https://www.instamojo.com/@famechase
5. After successful payment, user returns to site
6. Purchase is recorded in `purchases` table
7. User can download products immediately

### Product Downloads
- All product downloads are generated dynamically as PDFs
- Downloads are tracked in the `downloads` table
- Users can access their purchases at any time

### Admin Dashboard
- Access at `/admin-login`
- View all users, purchases, and revenue stats
- Filter and search capabilities
- Real-time data from Supabase

## Database Security

All tables have Row Level Security (RLS) enabled with these policies:

- **Products**: Publicly readable (for shop page)
- **Users**: Public insert for quiz submission, public read
- **Purchases**: Public access for payment flow
- **Downloads**: Public access for download functionality
- **Admin Users**: Service role only (secure)

## Troubleshooting

If you encounter any issues:

1. Check that all tables were created successfully
2. Verify that the products table has 6 products
3. Ensure the admin_users table has the default admin account
4. Check Supabase logs for any errors

## Environment Variables

Your `.env` file is already configured with:

```
VITE_SUPABASE_URL=https://lqjfyogttlsubccnllyd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxamZ5b2d0dGxzdWJjY25sbHlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTMzNTEsImV4cCI6MjA3NTM4OTM1MX0.8C3cTziuKAvsYw635ojLCfyYC-IM4zonEmULKqzN9v0
```

No additional configuration needed!
