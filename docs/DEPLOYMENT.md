# Deployment Guide

## Production Hosting Options

### Option 1: Railway (Recommended)

Railway is the easiest option for deployment:

1. **Connect GitHub repository**
2. **Auto-deploy** from main branch
3. **Built-in PostgreSQL** database
4. **Automatic SSL** certificates
5. **Environment variables** management

**Setup:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add postgresql
railway deploy
```

**Cost:** ~$5-10/month

### Option 2: DigitalOcean App Platform

Similar to Railway but with more configuration options:

1. **GitHub integration**
2. **Managed databases**
3. **Custom domains**
4. **Scaling options**

**Cost:** ~$10-15/month

### Option 3: Traditional VPS

For more control (requires server management):

**Recommended VPS providers:**
- DigitalOcean Droplets
- Linode
- Vultr

**Setup requirements:**
- Ubuntu 20.04+ server
- Node.js runtime
- PostgreSQL database
- Nginx reverse proxy
- SSL certificate (Let's Encrypt)
- PM2 process manager

**Cost:** ~$6-20/month

## Domain Configuration

You'll need to set up subdomains:

### Main Website (Current)
- `lucidda.tattoo` - Your existing static website

### New Scheduler System
- `api.lucidda.tattoo` - Backend API
- `book.lucidda.tattoo` - Client booking interface (optional)

### DNS Configuration

Add these DNS records in Namecheap:

```
Type    Name    Value                   TTL
A       api     [your-server-ip]        Automatic
CNAME   book    api.lucidda.tattoo      Automatic
```

## Environment Variables for Production

### Server Production Environment

```env
# Database (from hosting provider)
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=lucidda_scheduler
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# JWT (generate strong secret)
JWT_SECRET=super_secure_random_string_here
JWT_EXPIRES_IN=7d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=lucia@lucidda.tattoo
EMAIL_PASSWORD=your_app_specific_password

# iOS Push Notifications
APNS_KEY_ID=your_apns_key_id
APNS_TEAM_ID=your_apple_team_id
APNS_BUNDLE_ID=com.lucidda.scheduler
APNS_PRODUCTION=true

# Server
PORT=3001
NODE_ENV=production
CLIENT_URL=https://book.lucidda.tattoo
MAIN_WEBSITE_URL=https://lucidda.tattoo
TIMEZONE=America/Argentina/Jujuy
```

## Deployment Steps

### 1. Prepare Repository

```bash
# Ensure all code is committed
git add .
git commit -m "Initial scheduler implementation"
git push origin main
```

### 2. Set Up Hosting

**For Railway:**
```bash
railway init
railway add postgresql
railway deploy
```

**For other platforms:**
- Create account
- Connect GitHub repository
- Add PostgreSQL database
- Configure environment variables

### 3. Run Database Migration

```bash
# SSH into your server or use hosting platform's console
cd /path/to/your/app
npm run db:migrate
```

### 4. Create Artist Account

```bash
node scripts/create-artist.js
```

### 5. Test Deployment

- Visit your API health endpoint: `https://api.lucidda.tattoo/api/health`
- Create a test booking link through API
- Test the booking flow

## Integration with Existing Website

### Option 1: Subdomain Integration

Keep booking system separate at `book.lucidda.tattoo`

### Option 2: Path-based Integration

Integrate booking into main website at `lucidda.tattoo/book/*`

**Implementation:**
```html
<!-- Add to your main website -->
<script>
  // Handle booking routes
  if (window.location.pathname.startsWith('/book/')) {
    window.location.href = 'https://book.lucidda.tattoo' + window.location.pathname;
  }
</script>
```

## SSL Certificate Setup

### Automatic SSL (Railway/DO App Platform)
SSL is automatically provided and managed.

### Manual SSL (VPS)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.lucidda.tattoo -d book.lucidda.tattoo

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### Basic Monitoring

```bash
# Server health check
curl https://api.lucidda.tattoo/api/health

# Application logs
pm2 logs lucidda-scheduler
```

### Recommended Monitoring Tools

1. **Uptime monitoring** (UptimeRobot, Pingdom)
2. **Error tracking** (Sentry)
3. **Performance monitoring** (New Relic, DataDog)

## Backup Strategy

### Database Backups

```bash
# Daily PostgreSQL backup
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DB_NAME="lucidda_scheduler"
DATE=$(date +%Y%m%d_%H%M%S)

pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

## Security Considerations

### 1. Environment Variables
- Never commit secrets to Git
- Use strong JWT secrets
- Rotate passwords regularly

### 2. Rate Limiting
Already implemented in the backend:
- 100 requests per 15 minutes per IP

### 3. Input Validation
- Email validation
- DNI format validation
- SQL injection protection (parameterized queries)

### 4. HTTPS Enforcement
- Force HTTPS in production
- Secure cookies
- HSTS headers

## Post-Deployment Checklist

- [ ] API health check passes
- [ ] Database migration completed
- [ ] Artist account created
- [ ] Email sending works
- [ ] Test booking flow end-to-end
- [ ] SSL certificate valid
- [ ] Domain DNS propagated
- [ ] Monitoring set up
- [ ] Backup system configured
- [ ] Documentation updated

## Estimated Costs

### Monthly Operating Costs

| Component | Option | Cost |
|-----------|--------|------|
| Hosting | Railway | $5-10 |
| | DigitalOcean | $10-15 |
| | VPS | $6-20 |
| Domain | Existing | $0 |
| Email | Gmail | $0 |
| SSL | Auto/LetsEncrypt | $0 |
| **Total** | | **$5-20/month** |

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly:**
   - Monitor error logs
   - Check booking success rate
   - Verify email delivery

2. **Monthly:**
   - Update dependencies
   - Review security logs
   - Check database performance

3. **Quarterly:**
   - Security audit
   - Performance optimization
   - Backup restore test

This system will give Lucia complete control over her scheduling while providing clients with a smooth booking experience!
