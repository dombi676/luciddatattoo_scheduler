# Hosting Guide: Vercel + Supabase

## Overview

**Perfect Choice!** Vercel + Supabase is an excellent modern stack for your tattoo scheduling system:

- **Vercel**: Best hosting for Next.js apps (made by the Next.js creators)
- **Supabase**: Modern PostgreSQL alternative to Firebase with real-time features
- **Cost**: Very affordable with generous free tiers
- **Performance**: Global CDN and edge functions
- **Developer Experience**: Git-based deployments and instant previews

## Why This Stack is Perfect for You

### ✅ Benefits
- **Zero Configuration**: Vercel detects Next.js automatically
- **Global Performance**: CDN in 30+ regions including South America
- **Free Tier**: Generous limits for personal projects
- **Automatic HTTPS**: SSL certificates included
- **Real-time Database**: Supabase provides real-time subscriptions
- **Easy Scaling**: Pay only for what you use
- **Argentina-Friendly**: Good performance in South America

### 💰 Costs (All with Free Tiers)

**Vercel Free Tier:**
- ✅ 100GB bandwidth/month
- ✅ Unlimited personal projects
- ✅ Custom domains
- ✅ Automatic HTTPS
- ✅ Preview deployments

**Supabase Free Tier:**
- ✅ 500MB database
- ✅ 2GB bandwidth/month
- ✅ 50MB file storage
- ✅ Real-time subscriptions
- ✅ Authentication (bonus!)

**Total Monthly Cost: $0** (for typical usage)

## Migration Strategy

### Phase 1: Database Migration (PostgreSQL → Supabase)

1. **Export your current PostgreSQL data:**
   ```bash
   pg_dump your_database > tattoo_scheduler_backup.sql
   ```

2. **Create Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Choose region closest to Argentina (likely São Paulo)

3. **Import schema and data:**
   - Use Supabase SQL Editor
   - Run your schema.sql
   - Import your data

### Phase 2: App Migration (Current → Vercel)

1. **Update database connection for Supabase:**
   - Use Supabase connection string
   - Enable Row Level Security (RLS)

2. **Deploy to Vercel:**
   - Connect GitHub repository
   - Automatic deployment on push

### Phase 3: Static Website Migration

Move your existing static website to Vercel as well:
- Same CDN performance
- Custom domains
- Easy management

## Step-by-Step Deployment Guide

### 1. Update Dependencies for Supabase

Add Supabase to your package.json:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    // ... existing dependencies
  }
}
```

### 2. Environment Variables for Production

Create these environment variables in Vercel:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret (generate a new secure one)
JWT_SECRET=your_super_secure_jwt_secret

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Admin User
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password
```

### 3. Database Schema for Supabase

Your existing PostgreSQL schema works perfectly with Supabase. Just need to add Row Level Security:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_links ENABLE ROW LEVEL SECURITY;

-- Admin access policies (for your API routes)
CREATE POLICY "Admin access" ON users FOR ALL USING (true);
CREATE POLICY "Admin access" ON clients FOR ALL USING (true);
CREATE POLICY "Admin access" ON appointments FOR ALL USING (true);
CREATE POLICY "Admin access" ON working_hours FOR ALL USING (true);
CREATE POLICY "Admin access" ON day_overrides FOR ALL USING (true);
CREATE POLICY "Admin access" ON booking_links FOR ALL USING (true);
```

### 4. Deploy to Vercel

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Migrate to Next.js with Supabase"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - "Import Project" from GitHub
   - Select your repository
   - Vercel auto-detects Next.js

3. **Add environment variables:**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all the variables from step 2

4. **Deploy:**
   - Vercel automatically builds and deploys
   - Get your URL: `https://your-project.vercel.app`

### 5. Custom Domain Setup

1. **In Vercel dashboard:**
   - Go to Domains
   - Add your custom domain
   - Follow DNS configuration

2. **For your existing static site:**
   - Create new Vercel project
   - Import static files
   - Same domain management

## Migration Checklist

### ✅ Before Migration
- [ ] Backup current PostgreSQL database
- [ ] Test Next.js app locally
- [ ] Prepare custom domain DNS settings
- [ ] Create Supabase account

### ✅ During Migration
- [ ] Create Supabase project
- [ ] Import database schema and data
- [ ] Update database connection strings
- [ ] Deploy to Vercel
- [ ] Configure environment variables
- [ ] Test all functionality

### ✅ After Migration
- [ ] Set up custom domain
- [ ] Configure email notifications
- [ ] Monitor performance
- [ ] Set up analytics (optional)

## Alternative Options (If Needed)

### Option 2: Railway + PostgreSQL
- **Cost**: ~$5/month for database
- **Good for**: More control over database
- **Region**: US-based but good global performance

### Option 3: DigitalOcean App Platform
- **Cost**: ~$5-12/month
- **Good for**: Traditional hosting feel
- **Region**: Multiple regions including Toronto (close to Argentina)

### Option 4: Netlify + PlanetScale
- **Cost**: Free tier available
- **Good for**: JAMstack preference
- **Performance**: Global CDN

## Why Vercel + Supabase is Best for You

1. **Cost**: Free for your usage level
2. **Performance**: Excellent in Argentina/South America
3. **Simplicity**: Zero configuration
4. **Scalability**: Grows with your business
5. **Developer Experience**: Best-in-class
6. **Real-time**: Built-in for future features
7. **Security**: Enterprise-grade included

## Next Steps

1. **Create Supabase account** and project
2. **Push your code to GitHub**
3. **Connect to Vercel**
4. **Migrate database to Supabase**
5. **Configure custom domain**
6. **Test everything**

Your tattoo scheduling system will be live globally with enterprise-grade performance and security - all for free! 🎉

## Support

- **Vercel**: Excellent documentation and community
- **Supabase**: Great Discord community and docs
- **Performance**: Monitor with Vercel Analytics
- **Costs**: Both platforms have transparent pricing

Would you like me to help you with any specific part of this migration process?
