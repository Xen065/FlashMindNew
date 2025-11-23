# FlashMind Deployment Guide

This guide provides step-by-step instructions for deploying FlashMind to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Configuration](#database-configuration)
- [Email Service Setup](#email-service-setup)
- [Security Configuration](#security-configuration)
- [Deployment Options](#deployment-options)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js**: v18.x or v20.x LTS (tested with v22.21.1)
- **PostgreSQL**: v12 or higher (recommended for production)
- **Git**: For version control
- **Process Manager**: PM2 or systemd (for Node.js process management)
- **Reverse Proxy**: Nginx or Apache (recommended)
- **SSL Certificate**: Let's Encrypt or commercial SSL

### Required Accounts

- **Email Service**: SendGrid, AWS SES, or similar SMTP provider
- **Database Hosting**: (if not self-hosted) AWS RDS, DigitalOcean, etc.
- **Server**: DigitalOcean, AWS EC2, Heroku, Vercel, etc.

## Environment Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url> flashmind
cd flashmind

# Install backend dependencies
cd backend
npm install --production

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cd ../backend
cp .env.example .env

# Edit .env with your production values
nano .env
```

### Critical Environment Variables

#### Application Settings
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
```

#### Database Configuration (PostgreSQL)
```env
DB_DIALECT=postgres
DB_HOST=your-db-host.com
DB_PORT=5432
DB_NAME=flashmind_production
DB_USER=flashmind_user
DB_PASSWORD=<STRONG_PASSWORD_HERE>
```

#### JWT Secret (CRITICAL)
```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env
JWT_SECRET=<generated_secret_here>
JWT_EXPIRE=7d
```

#### Email Configuration
See [Email Service Setup](#email-service-setup) section below.

## Database Configuration

### PostgreSQL Setup

#### Option 1: Managed Database (Recommended)

**DigitalOcean Managed Database:**
```bash
# Get connection details from DigitalOcean dashboard
DB_HOST=db-postgresql-nyc1-xxxxx.ondigitalocean.com
DB_PORT=25060
DB_NAME=flashmind_db
DB_USER=doadmin
DB_PASSWORD=<provided_by_digitalocean>
```

**AWS RDS:**
```bash
# Get endpoint from RDS console
DB_HOST=flashmind.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=flashmind_production
DB_USER=admin
DB_PASSWORD=<your_password>
```

#### Option 2: Self-Hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql

CREATE DATABASE flashmind_production;
CREATE USER flashmind_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE flashmind_production TO flashmind_user;
\q
```

### Database Migration

```bash
# Run database migrations
cd backend
npm run migrate

# Or manually sync (development only)
node -e "require('./config/database').sync()"
```

### Database Backup Strategy

**Automated Daily Backups:**
```bash
# Create backup script
cat > /usr/local/bin/backup-flashmind-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/flashmind"
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U flashmind_user flashmind_production | gzip > $BACKUP_DIR/flashmind_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "flashmind_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-flashmind-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-flashmind-db.sh") | crontab -
```

## Email Service Setup

### Option 1: SendGrid (Recommended - Free Tier)

**Free Tier:** 100 emails/day

```bash
# Sign up at sendgrid.com
# Create API key in Settings > API Keys

# Add to .env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=<your_sendgrid_api_key>
EMAIL_FROM=noreply@yourdomain.com
```

**Domain Verification:**
- Add SendGrid DNS records to verify your domain
- This improves email deliverability

### Option 2: AWS SES (Scalable)

**Pricing:** $0.10 per 1,000 emails

```bash
# Set up SES in AWS Console
# Verify domain and email addresses
# Generate SMTP credentials

# Add to .env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your_smtp_username>
SMTP_PASS=<your_smtp_password>
EMAIL_FROM=noreply@yourdomain.com
```

### Option 3: Gmail (Not Recommended for Production)

```bash
# Enable 2FA on your Google account
# Generate App-Specific Password

# Add to .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASS=<app_specific_password>
EMAIL_FROM=your.email@gmail.com
```

**Limitations:**
- Daily sending limit: ~500 emails
- May be flagged as spam
- Not suitable for production use

## Security Configuration

### 1. JWT Secret

```bash
# NEVER use the default JWT secret in production!
# Generate a cryptographically secure secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. HTTPS/SSL Setup (Nginx + Let's Encrypt)

```bash
# Install Nginx and Certbot
sudo apt install nginx certbot python3-certbot-nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/flashmind
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React app)
    location / {
        root /var/www/flashmind/frontend/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/flashmind /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Restart Nginx
sudo systemctl restart nginx
```

### 3. Firewall Configuration

```bash
# Enable UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 4. Rate Limiting

Rate limiting is already configured in `backend/middleware/rateLimiter.js`:
- **Login:** 5 attempts per 15 minutes per IP
- **Register:** 10 attempts per hour per IP
- **General API:** 100 requests per 15 minutes per IP

Adjust these values if needed for your use case.

## Deployment Options

### Option 1: Traditional VPS (DigitalOcean, Linode, AWS EC2)

#### 1. Build Frontend

```bash
cd frontend

# Update API URL in .env
echo "REACT_APP_API_URL=https://yourdomain.com/api" > .env.production

# Build for production
npm run build
```

#### 2. Deploy Backend with PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name flashmind-api

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

#### 3. Copy Frontend Build

```bash
# Copy frontend build to web root
sudo mkdir -p /var/www/flashmind
sudo cp -r frontend/build/* /var/www/flashmind/frontend/build/
```

### Option 2: Heroku

#### Backend Deployment

```bash
# Install Heroku CLI
# Create Heroku app
heroku create flashmind-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
heroku config:set FRONTEND_URL=https://flashmind.vercel.app

# Deploy
git push heroku main
```

#### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### Option 3: Docker (Optional)

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 5000
CMD ["node", "server.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: flashmind_db
      POSTGRES_USER: flashmind
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_NAME=flashmind_db
      - DB_USER=flashmind
      - DB_PASSWORD=${DB_PASSWORD}
    depends_on:
      - postgres

volumes:
  postgres_data:
```

```bash
# Deploy with Docker Compose
docker-compose up -d
```

## Post-Deployment Checklist

### Critical Security Checks

- [ ] **JWT_SECRET** is set to a strong, unique value (not default)
- [ ] **NODE_ENV** is set to `production`
- [ ] **HTTPS/SSL** is enabled and working
- [ ] **Database passwords** are strong and secure
- [ ] **.env file** is NOT committed to version control
- [ ] **Firewall** is properly configured
- [ ] **Database backups** are automated and tested
- [ ] **Rate limiting** is enabled and tested
- [ ] **Email service** is configured and working

### Functionality Tests

```bash
# Test health endpoint
curl https://yourdomain.com/api/health

# Test registration
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!"}'

# Test password reset request
curl -X POST https://yourdomain.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check rate limiting (should block after 5 attempts)
for i in {1..6}; do
  curl -X POST https://yourdomain.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"wrong@example.com","password":"wrong"}'
done
```

### Monitoring Setup

**PM2 Monitoring:**
```bash
# View logs
pm2 logs flashmind-api

# Monitor resources
pm2 monit

# Enable PM2 monitoring dashboard (optional)
pm2 link <secret> <public>
```

**Database Monitoring:**
```bash
# Check PostgreSQL connections
psql -h localhost -U flashmind_user -d flashmind_production -c "SELECT count(*) FROM pg_stat_activity;"

# Check database size
psql -h localhost -U flashmind_user -d flashmind_production -c "SELECT pg_size_pretty(pg_database_size('flashmind_production'));"
```

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# Check if PostgreSQL is running
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Email Not Sending

```bash
# Check backend logs
pm2 logs flashmind-api

# Test SMTP connection (Node.js)
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
transporter.verify().then(console.log).catch(console.error);
"
```

### Rate Limiting Too Strict

Edit `backend/middleware/rateLimiter.js` and adjust limits:
```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Increase from 5 to 10
  // ...
});
```

### Environment Variables Not Loading

```bash
# Verify .env file exists and has correct permissions
ls -la /path/to/backend/.env

# Check if environment variables are loaded
node -e "console.log(process.env.JWT_SECRET)"

# Restart backend after .env changes
pm2 restart flashmind-api
```

### High Memory Usage

```bash
# Check Node.js memory usage
pm2 info flashmind-api

# Set Node.js memory limit
pm2 delete flashmind-api
pm2 start server.js --name flashmind-api --max-memory-restart 500M
```

## Maintenance

### Regular Updates

```bash
# Update dependencies (monthly)
cd backend
npm audit fix
npm update

# Test thoroughly before deploying updates
npm test

# Deploy updates
pm2 restart flashmind-api
```

### Database Maintenance

```bash
# Vacuum database (monthly)
psql -h localhost -U flashmind_user -d flashmind_production -c "VACUUM ANALYZE;"

# Check for unused indexes
psql -h localhost -U flashmind_user -d flashmind_production -c "
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;
"
```

### Log Rotation

```bash
# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Support

For issues or questions:
- Check [Troubleshooting](#troubleshooting) section
- Review backend logs: `pm2 logs flashmind-api`
- Check database logs
- Verify environment variables are set correctly
- Ensure all services (PostgreSQL, Nginx, etc.) are running

## Security Incident Response

If you suspect a security breach:
1. **Immediately rotate JWT_SECRET**
2. **Force logout all users** (invalidate all tokens)
3. **Review database logs** for suspicious activity
4. **Check for unauthorized password resets**
5. **Review IP addresses** in PasswordReset audit trail
6. **Update all passwords** (database, email, etc.)
7. **Enable additional monitoring**

---

**Last Updated:** 2025-11-22
**Version:** 1.0
