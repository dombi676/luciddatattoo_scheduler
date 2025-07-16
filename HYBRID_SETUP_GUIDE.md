# Hybrid Setup: Subdomain Configuration Guide

## 🎯 Your Chosen Strategy: Hybrid Approach

### Setup Overview:
- **Main site**: `lucidda.tattoo` stays on Namecheap + Cloudflare
- **Scheduler**: `turnos.lucidda.tattoo` goes to Vercel + Supabase
- **Risk**: Minimal - your main site stays untouched

## 🌐 How Subdomains Work

### Who Controls What:
1. **Domain Registration**: Porkbun (where you bought lucidda.tattoo)
2. **DNS Management**: Cloudflare (since you're using their CDN)
3. **Subdomain Creation**: Done through **Cloudflare DNS**, not Porkbun

### The Process:
```
Domain: lucidda.tattoo (Porkbun registered)
    ↓
DNS: Managed by Cloudflare 
    ↓
Subdomain: turnos.lucidda.tattoo (Cloudflare DNS record)
    ↓
Points to: Vercel servers
```

## 📋 Step-by-Step Subdomain Setup

### Step 1: Deploy Scheduler to Vercel
1. **Push your code to GitHub**
2. **Connect to Vercel** (free account)
3. **Deploy** → Get a URL like `your-project.vercel.app`
4. **Test** that everything works

### Step 2: Create Subdomain in Cloudflare
1. **Login to Cloudflare dashboard**
2. **Select your lucidda.tattoo domain**
3. **Go to DNS section**
4. **Add new DNS record**:
   ```
   Type: CNAME
   Name: turnos
   Target: your-project.vercel.app
   Proxy: Enabled (orange cloud)
   ```

### Step 3: Configure Vercel for Custom Domain
1. **In Vercel dashboard** → Project Settings → Domains
2. **Add domain**: `turnos.lucidda.tattoo`
3. **Vercel will verify** DNS configuration
4. **Get automatic SSL** certificate

### Step 4: Test Everything
- `lucidda.tattoo` → Your current website (unchanged)
- `turnos.lucidda.tattoo` → Your new scheduler app

## 🔧 Detailed DNS Configuration

### Current Cloudflare DNS (Probably):
```
Type: A     Name: @       Target: [Namecheap IP]     Proxy: ✅
Type: A     Name: www     Target: [Namecheap IP]     Proxy: ✅
```

### Add This New Record:
```
Type: CNAME Name: turnos  Target: your-project.vercel.app  Proxy: ✅
```

### After Setup:
- `lucidda.tattoo` → Namecheap (unchanged)
- `www.lucidda.tattoo` → Namecheap (unchanged)  
- `turnos.lucidda.tattoo` → Vercel (new)

## ✅ Benefits of This Approach

### Risk Management:
- **Zero risk** to your main website
- **Easy rollback** if something goes wrong
- **Test thoroughly** before considering full migration

### Cost Savings:
- **Vercel**: Free for scheduler app
- **Supabase**: Free for database
- **Current hosting**: Keep paying for main site
- **Net result**: Save money on database hosting

### Performance:
- **Main site**: Same performance as before
- **Scheduler**: Potentially faster on Vercel
- **Global**: Subdomain gets Cloudflare CDN too

## 🚨 Potential Issues & Solutions

### Issue 1: Cloudflare + Vercel SSL
**Problem**: Sometimes Cloudflare proxy interferes with Vercel SSL
**Solution**: 
- Try with proxy enabled first (orange cloud)
- If issues, disable proxy (gray cloud) for turnos subdomain

### Issue 2: DNS Propagation
**Problem**: Subdomain might take time to work globally
**Solution**: 
- Wait 24-48 hours for full propagation
- Test with DNS checker tools

### Issue 3: Cookies/Authentication
**Problem**: Login cookies might not work across subdomains
**Solution**: 
- Configure JWT cookies for `.lucidda.tattoo` domain
- Update cookie settings in your Next.js app

## 🔄 Migration Path Forward

### Phase 1: Hybrid Setup (Now)
```
lucidda.tattoo → Namecheap + Cloudflare
turnos.lucidda.tattoo → Vercel + Supabase
```

### Phase 2: Test & Optimize (1-2 months)
- Monitor performance from Argentina
- Test all booking flows thoroughly
- Get comfortable with Vercel dashboard
- Optimize database performance

### Phase 3: Full Migration (When Ready)
- Move main site to Vercel
- Use single domain with path routing
- Cancel Namecheap hosting
- Maximum cost savings

## 📱 Client Experience

### Booking Flow:
1. **Client contacts you** (Instagram/WhatsApp)
2. **You create booking link** in admin: `turnos.lucidda.tattoo/abc123`
3. **Client books** on subdomain
4. **Confirmation email** from turnos.lucidda.tattoo

### Professional Appearance:
- Still looks like your domain
- Clients trust lucidda.tattoo branding
- Clean, professional URLs

## 💻 Technical Implementation

### Update Environment Variables:
```env
# In Vercel environment variables
NEXT_PUBLIC_APP_URL=https://turnos.lucidda.tattoo
```

### Update Cookie Configuration:
```javascript
// In your auth middleware
response.cookies.set('auth-token', token, {
  domain: '.lucidda.tattoo', // Works for all subdomains
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

### Update Booking Link Generation:
```javascript
// In admin panel
const bookingUrl = `https://turnos.lucidda.tattoo/turnos/${linkId}`;
```

## 🎯 Next Steps

### This Week:
1. **Create GitHub repository** with your code
2. **Sign up for Vercel** (free)
3. **Deploy to Vercel** → get your-project.vercel.app URL
4. **Test the deployment** thoroughly

### Next Week:
1. **Add subdomain DNS record** in Cloudflare
2. **Configure custom domain** in Vercel
3. **Set up Supabase** database
4. **Test subdomain** booking flow

### Ongoing:
1. **Monitor performance** vs current setup
2. **Collect feedback** from first clients using it
3. **Decide on full migration** timeline

## 🚀 Why This is Perfect

- **Safe**: Your main site stays exactly as is
- **Cost-effective**: Start saving on database/VPS costs immediately  
- **Professional**: Clean subdomain that clients will trust
- **Scalable**: Easy to expand or migrate later
- **Learning**: Get comfortable with modern tools gradually

Ready to start with the GitHub + Vercel deployment? I can walk you through each step! 🎉
