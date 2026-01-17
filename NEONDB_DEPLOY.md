# 🚀 Deployment with NeonDB + Render + Vercel

## Overview
- **Database**: NeonDB (Serverless Postgres)
- **Backend**: Render (Node.js API)
- **Frontend**: Vercel (Next.js)

## Step 1: Setup NeonDB Database

### 1. Create NeonDB Account
1. Go to https://neon.tech
2. Sign up for free account
3. Create new project

### 2. Get Database Connection String
1. In NeonDB Dashboard → Connection Details
2. Copy the **Connection string** (Pooled connection)
3. It looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

**Important**: Use the **Pooled connection string** for better performance.

---

## Step 2: Deploy Backend to Render

### 1. Create Web Service
1. Go to https://dashboard.render.com/create?type=web
2. Connect GitHub: `MUGIWARA-D-LUFFY/OnlyFans`
3. Configure:
   - **Name**: `onlyfans-backend`
   - **Region**: Oregon (or closest to your NeonDB region)
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: 
     ```bash
     npm install && npm run build
     ```
   - **Start Command**: 
     ```bash
     npm run start:prod
     ```
   - **Plan**: Free

### 2. Environment Variables
Add these in Render:

```bash
# NeonDB Connection String (from Step 1)
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-at-least-32-chars

# App Config
PORT=3001
NODE_ENV=production
```

### 3. Deploy
Click **Create Web Service** and wait for deployment.

### 4. Run Database Migrations
After backend deploys, open **Shell** in Render:

```bash
npx prisma migrate deploy
npx prisma db seed
```

**Your backend URL**: `https://your-backend.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

### 1. Create Vercel Project
1. Go to https://vercel.com/new
2. Import: `MUGIWARA-D-LUFFY/OnlyFans`
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2. Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://your-backend.onrender.com
```

Replace `your-backend` with your actual Render backend URL!

### 3. Deploy
Click **Deploy** and wait for completion.

**Your frontend URL**: `https://your-project.vercel.app`

---

## Why NeonDB?

✅ **Serverless**: Only pay for what you use
✅ **Fast**: Low latency, global edge network
✅ **Generous Free Tier**: 0.5 GB storage, 10 GB transfer/month
✅ **Autoscaling**: Scales to zero when not in use
✅ **Branching**: Database branches for dev/staging
✅ **No Expiration**: Unlike Render's 90-day limit

---

## NeonDB Features

### Connection Pooling
NeonDB provides two connection strings:
- **Pooled**: For serverless/edge (recommended for Render)
- **Direct**: For long-running connections

Always use **Pooled** for Render deployments.

### Database Branching
Create branches for testing:
```bash
# In NeonDB Console
Create Branch → dev
```

Then use different DATABASE_URL for dev deployments.

---

## Testing Your Deployment

### 1. Test Backend
```bash
curl https://your-backend.onrender.com
```

Should return: API health check or "Backend is running"

### 2. Test Database Connection
In Render Shell:
```bash
npx prisma studio
```

Or check connection:
```bash
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('Connected!')).catch(e => console.error(e))"
```

### 3. Test Frontend
Visit: `https://your-frontend.vercel.app`
- Register user
- Login
- Test features

---

## Troubleshooting

### "prisma: not found" Error
**Solution**: Already fixed! The build script now uses `npx prisma generate`.

### Database Connection Issues
**Problem**: Can't connect to NeonDB
**Solutions**:
1. Verify DATABASE_URL is correct
2. Ensure `?sslmode=require` is in connection string
3. Use **Pooled** connection string, not Direct
4. Check NeonDB project is active

### Migration Fails
**Problem**: Migrations won't apply
**Solution**:
```bash
# In Render Shell
npx prisma migrate reset --force
npx prisma migrate deploy
```

### Connection Timeouts
**Problem**: Database connection times out
**Solution**:
- Use Pooled connection string
- Check NeonDB project is in same region as Render
- Verify connection limits in NeonDB dashboard

---

## NeonDB Free Tier Limits

- **Storage**: 0.5 GB
- **Compute**: 200 hours/month
- **Data Transfer**: 10 GB/month
- **Branches**: 10
- **Projects**: Unlimited

When limits are reached, database becomes read-only.

---

## Upgrading Plans

### NeonDB Pro ($19/month)
- 10 GB storage
- Unlimited compute hours
- 100 GB data transfer
- More branches
- Point-in-time recovery

### Render Starter ($7/month)
- No spin-down
- Faster performance
- 100 GB bandwidth

### Total Monthly Cost
- **Free**: $0 (with limitations)
- **Basic Production**: $7 (Render) + $0 (NeonDB free tier)
- **Full Production**: $7 (Render) + $19 (NeonDB Pro) = $26/month

---

## Monitoring

### NeonDB Dashboard
- Monitor queries
- Check storage usage
- View connection statistics
- Set up alerts

### Render Dashboard
- View logs
- Monitor performance
- Check deployment status

### Vercel Dashboard
- Analytics
- Error tracking
- Performance metrics

---

## Best Practices

1. **Use Pooled Connections**: Essential for serverless
2. **Enable Connection Pooling**: Set `connection_limit=10` in DATABASE_URL
3. **Monitor Usage**: Check NeonDB dashboard regularly
4. **Backup Strategy**: NeonDB has automatic backups (Pro plan)
5. **Database Indexes**: Add indexes to frequently queried fields
6. **Connection Management**: Close Prisma connections properly

---

## Connection String Examples

### Pooled (Recommended for Render)
```
postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### With Connection Limit
```
postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&connection_limit=10
```

### With Schema
```
postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&schema=public
```

---

## Quick Reference

### Generate JWT Secrets
```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### Run Migrations (Render Shell)
```bash
npx prisma migrate deploy
```

### Seed Database (Render Shell)
```bash
npx prisma db seed
```

### View Database (Render Shell)
```bash
npx prisma studio
```

---

## Checklist

- [ ] NeonDB project created
- [ ] Pooled connection string copied
- [ ] Backend deployed to Render
- [ ] Environment variables added
- [ ] Migrations run successfully
- [ ] Database seeded
- [ ] Frontend deployed to Vercel
- [ ] Frontend connected to backend
- [ ] Test user registration
- [ ] Test login
- [ ] Test creator features

---

## Support

- NeonDB Docs: https://neon.tech/docs
- NeonDB Discord: https://discord.gg/neon
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs

---

## Success! 🎉

Your OnlyFans platform is now live with:
- ✅ NeonDB (Serverless Postgres)
- ✅ Backend on Render
- ✅ Frontend on Vercel
- ✅ Production-ready architecture

Visit your frontend URL and start using your platform!
