# FameChase.com Deployment Guide

## Complete Application Setup

This guide covers the deployment of the complete FameChase.com application with Supabase backend, PayU payment integration, and Netlify hosting.

## 🏗️ Architecture Overview

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (Database + Authentication + Edge Functions)
- **Payments**: PayU Gateway (Test Mode → Production)
- **Hosting**: Netlify with custom domain
- **Database**: PostgreSQL (via Supabase)

## 🚀 Deployment Steps

### 1. Supabase Setup

#### A. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note down your project URL and anon key

#### B. Database Setup

1. Go to SQL Editor in Supabase Dashboard
2. Run the script from `scripts/setup-database.sql`
3. This creates all necessary tables, policies, and indexes

#### C. Environment Variables

1. Update `.env.local` with your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### D. Supabase Edge Functions (Optional)

```bash
# Install Supabase CLI
npm install -g supabase

# Deploy functions
supabase functions deploy create-payment
supabase functions deploy verify-payment
```

### 2. PayU Integration

#### A. Test Mode Configuration

The application is pre-configured with PayU test credentials:

- Merchant Key: `WBtjxn`
- Salt: `Ui1z2GLGDx7sUixAtCdl42`

#### B. Production Setup

1. Get your PayU production credentials
2. Update environment variables:

```bash
VITE_PAYU_MERCHANT_KEY=your-production-key
VITE_PAYU_SALT=your-production-salt
VITE_PAYU_BASE_URL=https://secure.payu.in/_payment
VITE_PAYU_MODE=production
```

### 3. Netlify Deployment

#### A. Connect Repository

1. Push code to GitHub/GitLab
2. Connect repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist/spa`

#### B. Environment Variables

Add these in Netlify dashboard under Site Settings → Environment Variables:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PAYU_MERCHANT_KEY=WBtjxn
VITE_PAYU_SALT=Ui1z2GLGDx7sUixAtCdl42
VITE_PAYU_BASE_URL=https://test.payu.in/_payment
VITE_PAYU_MODE=test
VITE_APP_URL=https://famechase.com
```

#### C. Custom Domain Setup

1. In Netlify dashboard, go to Domain Settings
2. Add custom domain: `famechase.com`
3. Update DNS records as instructed
4. Enable HTTPS (automatic with Netlify)

### 4. PayU Webhook Configuration

#### A. Success URL

Set in PayU merchant dashboard:

```
https://famechase.com/payment-success
```

#### B. Failure URL

Set in PayU merchant dashboard:

```
https://famechase.com/payment-failure
```

## 🔧 Configuration Files

### Environment Variables Template

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# PayU Configuration
VITE_PAYU_MERCHANT_KEY=WBtjxn
VITE_PAYU_SALT=Ui1z2GLGDx7sUixAtCdl42
VITE_PAYU_BASE_URL=https://test.payu.in/_payment
VITE_PAYU_MODE=test

# Application Configuration
VITE_APP_URL=https://famechase.com
VITE_APP_ENV=production
```

## 🗄️ Database Schema

### Core Tables

- `users` - User profiles and quiz data
- `products` - Product catalog
- `purchases` - Order and payment records
- `downloads` - Download tracking

### Key Features

- Row Level Security (RLS) enabled
- Automatic timestamps
- Comprehensive indexes
- Secure policies

## 💳 Payment Flow

### 1. User Journey

1. User completes quiz → Profile created
2. User selects product → Payment form
3. Payment data sent to Supabase Edge Function
4. PayU payment hash generated
5. User redirected to PayU gateway
6. Payment completed → Callback to success/failure page
7. Payment verification via webhook

### 2. Security Features

- SHA512 hash verification
- Secure payment token generation
- Encrypted payment data
- PCI compliant payment flow

## 📊 Admin Dashboard

Access the admin dashboard at: `https://famechase.com/admin`

### Features

- Real-time user analytics
- Purchase tracking
- Revenue metrics
- User management
- Payment status monitoring

## 🔒 Security Considerations

### 1. Environment Variables

- Never commit `.env` files
- Use different keys for dev/prod
- Rotate keys regularly

### 2. Supabase Security

- RLS policies configured
- Service role key protected
- CORS properly configured

### 3. PayU Security

- Hash verification implemented
- Secure callback URLs
- Payment data encryption

## 🚀 Going Live Checklist

### Pre-Launch

- [ ] Database schema deployed
- [ ] All environment variables set
- [ ] PayU test transactions working
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Admin dashboard accessible

### Production Switch

- [ ] Update PayU to production mode
- [ ] Update PayU merchant credentials
- [ ] Change PayU base URL to production
- [ ] Test real payment flow
- [ ] Monitor error logs
- [ ] Verify webhook callbacks

### Post-Launch

- [ ] Monitor payment success rates
- [ ] Check user registration flow
- [ ] Verify download functionality
- [ ] Test admin dashboard
- [ ] Monitor server performance

## 🐛 Troubleshooting

### Common Issues

#### 1. Payment Failures

```bash
# Check PayU credentials
# Verify hash generation
# Confirm callback URLs
```

#### 2. Database Connection

```bash
# Verify Supabase URL/key
# Check RLS policies
# Confirm user permissions
```

#### 3. Deployment Issues

```bash
# Check build logs
# Verify environment variables
# Confirm redirects working
```

## 📞 Support

### Technical Support

- Email: tech@famechase.com
- Documentation: https://docs.famechase.com

### PayU Support

- Merchant Support: PayU Dashboard
- Technical Docs: https://docs.payu.in

### Supabase Support

- Community: https://supabase.com/community
- Documentation: https://supabase.com/docs

## 🎯 Performance Optimization

### Frontend

- Vite bundling optimization
- Code splitting implemented
- Image optimization
- CDN for static assets

### Backend

- Database indexes optimized
- Query performance tuned
- Edge functions for payments
- Caching strategies

### Monitoring

- Supabase dashboard metrics
- Netlify analytics
- PayU transaction monitoring
- Custom error tracking

---

**Deployment Status**: ✅ Complete FameChase.com application ready for production deployment.

**Features Implemented**:

- ✅ Quiz system with user profiling
- ✅ Product catalog with dynamic pricing
- ✅ PayU payment integration (test mode)
- ✅ Supabase backend with RLS
- ✅ Payment verification system
- ✅ Admin dashboard for user data
- ✅ Success/failure payment pages
- ✅ Netlify deployment configuration
- ✅ Custom domain setup ready
- ✅ Security best practices implemented

**Next Steps**: Update Supabase project credentials and deploy to Netlify with custom domain.
