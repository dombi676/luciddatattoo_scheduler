# Deployment Checklist: Vercel + Supabase

## ✅ Pre-Deployment

- [ ] **GitHub Repository**: Push your code to GitHub
- [ ] **Supabase Account**: Create account at [supabase.com](https://supabase.com)
- [ ] **Vercel Account**: Create account at [vercel.com](https://vercel.com)
- [ ] **Domain**: Prepare your custom domain (optional)

## ✅ Database Setup (Supabase)

1. **Create New Project**
   - [ ] Go to Supabase dashboard
   - [ ] Click "New Project"
   - [ ] Choose organization
   - [ ] Name: `lucid-tattoo-scheduler`
   - [ ] Region: `South America (São Paulo)` (closest to Argentina)
   - [ ] Database password: Generate strong password

2. **Import Database Schema**
   - [ ] Go to SQL Editor in Supabase
   - [ ] Copy and paste `database/schema.sql`
   - [ ] Run the schema
   - [ ] Copy and paste `database/supabase_migration.sql`
   - [ ] Run the migration

3. **Get Connection Details**
   - [ ] Go to Settings → Database
   - [ ] Copy these values:
     - [ ] `NEXT_PUBLIC_SUPABASE_URL`
     - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - [ ] `SUPABASE_SERVICE_ROLE_KEY`

## ✅ App Deployment (Vercel)

1. **Connect Repository**
   - [ ] Go to Vercel dashboard
   - [ ] Click "Import Project"
   - [ ] Connect your GitHub account
   - [ ] Select `luciddatattoo_scheduler` repository
   - [ ] Vercel auto-detects Next.js

2. **Configure Environment Variables**
   - [ ] Go to Project Settings → Environment Variables
   - [ ] Add these variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_super_secure_jwt_secret_32_chars_min
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=your_secure_admin_password
   ```

3. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait for build to complete
   - [ ] Get your deployment URL

## ✅ Initial Setup

1. **Initialize Database**
   - [ ] Open terminal in your local project
   - [ ] Update `.env.local` with Supabase credentials
   - [ ] Run: `npm run setup`
   - [ ] This creates admin user and default working hours

2. **Test Application**
   - [ ] Visit your Vercel URL
   - [ ] Go to `/admin`
   - [ ] Login with your admin credentials
   - [ ] Check that dashboard loads
   - [ ] Create a test booking link
   - [ ] Test booking flow

## ✅ Custom Domain (Optional)

1. **Configure Domain in Vercel**
   - [ ] Go to Project Settings → Domains
   - [ ] Add your domain
   - [ ] Get DNS configuration

2. **Update DNS Records**
   - [ ] Add A record or CNAME as instructed
   - [ ] Wait for DNS propagation (up to 24 hours)

3. **Update Environment Variables**
   - [ ] Change `NEXT_PUBLIC_APP_URL` to your custom domain
   - [ ] Redeploy if needed

## ✅ Static Website Migration

1. **Create New Vercel Project**
   - [ ] Import your static website repository
   - [ ] Or upload files directly
   - [ ] Configure custom domain

2. **Update Links**
   - [ ] Update any links between sites
   - [ ] Test cross-site navigation

## ✅ Post-Deployment

1. **Performance Testing**
   - [ ] Test from Argentina/South America
   - [ ] Check mobile responsiveness
   - [ ] Test all booking flows

2. **Monitoring Setup**
   - [ ] Enable Vercel Analytics (optional)
   - [ ] Set up Supabase monitoring
   - [ ] Configure error tracking

3. **Backup Strategy**
   - [ ] Set up regular database backups in Supabase
   - [ ] Document recovery procedures

## 🎯 Success Metrics

- [ ] **Page Load Speed**: < 2 seconds from Argentina
- [ ] **Uptime**: 99.9% (both Vercel and Supabase guarantee this)
- [ ] **Mobile Performance**: All features work on mobile
- [ ] **Booking Flow**: Complete booking takes < 2 minutes
- [ ] **Admin Access**: Dashboard loads in < 3 seconds

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check all environment variables are set
   - Ensure all dependencies are in package.json

2. **Database Connection Error**
   - Verify Supabase credentials
   - Check RLS policies are set correctly

3. **Auth Issues**
   - Verify JWT_SECRET is set
   - Check admin user was created

4. **Performance Issues**
   - Check Supabase region (should be São Paulo)
   - Monitor Vercel function execution times

## 💰 Cost Monitoring

### Free Tier Limits:
- **Vercel**: 100GB bandwidth/month
- **Supabase**: 500MB database, 2GB bandwidth/month

### When to Upgrade:
- **Vercel Pro ($20/month)**: When you exceed bandwidth
- **Supabase Pro ($25/month)**: When you need more database space

## 📞 Support

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **Community**: Both have active Discord communities

---

**Estimated Total Deployment Time**: 2-3 hours
**Monthly Cost**: $0 (free tier)
**Performance**: Enterprise-grade globally
