# 🚀 Render Deployment Guide

## Quick Deploy to Render

### Prerequisites
- GitHub account with code pushed
- Render account (free tier available at https://render.com)

## Option 1: One-Click Deploy (Easiest)

### Step 1: Create PostgreSQL Database
1. Go to https://dashboard.render.com/new/database
2. Configure:
   - **Name**: `onlyfans-db`
   - **Region**: Oregon (or closest to you)
   - **Plan**: Free
3. Click **Create Database**
4. Copy the **Internal Database URL** (starts with `postgresql://`)

### Step 2: Deploy Backend
1. Go to https://dashboard.render.com/create?type=web
2. Connect your GitHub repository: `MUGIWARA-D-LUFFY/OnlyFans`
3. Configure:
   - **Name**: `onlyfans-backend`
   - **Region**: Same as database
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   DATABASE_URL=your_internal_database_url_from_step_1
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-at-least-32-chars
   PORT=3001
   NODE_ENV=production
   ```

5. Click **Create Web Service**

### Step 3: Run Database Migrations
Once backend is deployed:
1. In Render Dashboard → Your Backend Service → Shell
2. Run:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

Or use Render's Build Command:
```bash
npm install && npm run build && npx prisma migrate deploy
```

### Step 4: Deploy Frontend
1. Go to https://dashboard.render.com/create?type=web
2. Connect same repository: `MUGIWARA-D-LUFFY/OnlyFans`
3. Configure:
   - **Name**: `onlyfans-frontend`
   - **Region**: Same as backend
   - **Root Directory**: `frontend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   NEXT_PUBLIC_WS_URL=wss://your-backend-url.onrender.com
   ```

5. Click **Create Web Service**

## Option 2: Blueprint Deploy (Automated)

If you want to deploy everything at once:

1. Push `render.yaml` to your repository
2. Go to https://dashboard.render.com/blueprints
3. Connect repository
4. Render will automatically create all services

## Environment Variables

### Backend (.env)
```bash
# Database (from Render PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your-32-char-secret-here
JWT_REFRESH_SECRET=your-32-char-refresh-secret-here

# App Config
PORT=3001
NODE_ENV=production
```

### Frontend
```bash
# API URLs (replace with your backend URL)
NEXT_PUBLIC_API_URL=https://onlyfans-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://onlyfans-backend.onrender.com
```

## Post-Deployment

### 1. Verify Backend
Visit: `https://your-backend.onrender.com`
Should see: `{"message": "Backend is running"}`

### 2. Run Migrations
In backend service shell:
```bash
npx prisma migrate deploy
npx prisma db seed
```

### 3. Test Frontend
Visit: `https://your-frontend.onrender.com`
- Test user registration
- Test login
- Test creator features

## Troubleshooting

### Build Fails
**Error**: `nest: not found`
**Solution**: Already fixed! The package.json now includes `@nestjs/cli` in dependencies.

**Error**: `Cannot find module '@nestjs/core'`
**Solution**: Clear build cache in Render dashboard and redeploy.

### Database Connection Issues
**Error**: `Can't reach database server`
**Solution**: 
- Use **Internal Database URL** (not External)
- Verify DATABASE_URL is set correctly
- Check if database and backend are in same region

### Migration Issues
**Error**: `Migration failed`
**Solution**:
```bash
# In backend shell
npx prisma migrate reset --force
npx prisma migrate deploy
npx prisma db seed
```

### Frontend Can't Connect to Backend
**Error**: `Network Error` or `CORS`
**Solution**:
- Verify NEXT_PUBLIC_API_URL is correct
- Check backend is running (visit backend URL)
- Backend already configured for CORS

## Free Tier Limitations

Render Free Tier includes:
- ⏱️ Services spin down after 15 minutes of inactivity
- 🔄 First request after spin-down takes ~30 seconds
- 💾 750 hours/month per service
- 🗄️ PostgreSQL free tier (expires after 90 days)

**Workaround for spin-down**: Use a service like [UptimeRobot](https://uptimerobot.com) to ping your backend every 5-10 minutes.

## Upgrading Database

After 90 days, Render free databases expire. Options:
1. Upgrade to Render paid plan ($7/month)
2. Use external database (Supabase, Railway, etc.)
3. Migrate to new free database

### Migrate to External Database:
1. Create database on Supabase/Railway
2. Update DATABASE_URL in Render
3. Run migrations: `npx prisma migrate deploy`
4. Redeploy

## Custom Domain

1. Go to your service → Settings → Custom Domain
2. Add your domain (e.g., `mysite.com`)
3. Update DNS records as instructed
4. SSL is automatic!

## Monitoring & Logs

- **View Logs**: Dashboard → Service → Logs
- **Metrics**: Dashboard → Service → Metrics
- **Shell Access**: Dashboard → Service → Shell

## Performance Tips

1. **Keep Services Warm**: Use UptimeRobot or similar
2. **Optimize Build**: Cache dependencies
3. **Database Indexing**: Add indexes to frequently queried fields
4. **CDN**: Use for static assets
5. **Region**: Deploy in region closest to users

## Cost Estimate

**Free Tier** (Suitable for development/demo):
- Backend: Free
- Frontend: Free
- Database: Free (90 days)
- **Total**: $0

**Starter Plan** (Production ready):
- Backend: $7/month
- Frontend: $7/month
- Database: $7/month
- **Total**: $21/month

## Useful Commands

### In Render Shell (Backend)
```bash
# Check database connection
npx prisma studio

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Check Node version
node --version

# Check installed packages
npm list --depth=0
```

## Support & Resources

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Status Page: https://status.render.com

## Checklist

- [ ] PostgreSQL database created
- [ ] Backend deployed
- [ ] DATABASE_URL configured
- [ ] JWT secrets set
- [ ] Migrations run
- [ ] Database seeded
- [ ] Frontend deployed
- [ ] Frontend API URL configured
- [ ] Test registration/login
- [ ] Test creator features
- [ ] Set up monitoring (optional)
- [ ] Configure custom domain (optional)

## Next Steps

1. **Monitor Usage**: Check Render dashboard regularly
2. **Set Up Backups**: For paid plans
3. **Add Monitoring**: Use UptimeRobot or similar
4. **Optimize Performance**: Review logs and metrics
5. **Scale**: Upgrade plans as needed

---

## Need Help?

- Check logs in Render dashboard
- Review [Common Issues](#troubleshooting)
- Contact Render support
- Open issue on GitHub
