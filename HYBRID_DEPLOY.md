# 🚀 Hybrid Deployment: Backend on Render + Frontend on Vercel

## Overview
- **Backend**: Render (better for Node.js servers, free PostgreSQL)
- **Frontend**: Vercel (optimized for Next.js, faster deployments)

## Step-by-Step Deployment

### Part 1: Backend on Render

#### 1. Create PostgreSQL Database
1. Go to https://dashboard.render.com/new/database
2. Configure:
   - **Name**: `onlyfans-db`
   - **Region**: Oregon (or closest to you)
   - **Plan**: Free
3. Click **Create Database**
4. Copy the **Internal Database URL**

#### 2. Deploy Backend
1. Go to https://dashboard.render.com/create?type=web
2. Connect GitHub: `MUGIWARA-D-LUFFY/OnlyFans`
3. Configure:
   - **Name**: `onlyfans-backend`
   - **Region**: Same as database
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: 
     ```bash
     npm install && npx nest build && npx prisma generate
     ```
   - **Start Command**: 
     ```bash
     npm run start:prod
     ```
   - **Plan**: Free

4. **Environment Variables**:
   ```bash
   DATABASE_URL=your_internal_database_url
   JWT_SECRET=generate-with-openssl-rand-base64-32
   JWT_REFRESH_SECRET=generate-with-openssl-rand-base64-32
   PORT=3001
   NODE_ENV=production
   ```

5. Click **Create Web Service**

#### 3. Run Migrations
After backend deploys, open Shell in Render:
```bash
npx prisma migrate deploy
npx prisma db seed
```

**Your backend URL**: `https://onlyfans-backend.onrender.com`

---

### Part 2: Frontend on Vercel

#### 1. Deploy Frontend to Vercel
1. Go to https://vercel.com/new
2. Import: `MUGIWARA-D-LUFFY/OnlyFans`
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

#### 2. Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com
NEXT_PUBLIC_WS_URL=wss://your-backend-name.onrender.com
```

**Important**: Replace `your-backend-name` with your actual Render backend URL!

3. Click **Deploy**

**Your frontend URL**: `https://your-project.vercel.app`

---

## CORS Configuration (Already Done ✅)

The backend is already configured to accept requests from any origin in production. No changes needed!

Location: `backend/src/main.ts`
```typescript
app.enableCors({
  origin: true, // Accepts all origins in production
  credentials: true,
});
```

---

## Update Backend URL in Frontend

After you get your Render backend URL:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` to your Render backend URL
3. **Redeploy** frontend (Vercel → Deployments → Redeploy)

---

## Testing Your Deployment

### 1. Test Backend
Visit: `https://your-backend.onrender.com`

Should see: API is running or health check response

### 2. Test Frontend
Visit: `https://your-frontend.vercel.app`

- Register a new user
- Login
- Test creator features
- Upload posts

---

## Important Notes

### Backend (Render)
- ⏱️ **Free tier spins down** after 15 mins inactivity
- 🔄 First request takes ~30 seconds to wake up
- 💾 Free PostgreSQL expires after 90 days
- ✅ Good for: API servers, databases

### Frontend (Vercel)
- ⚡ **Always instant** - no spin down
- 🚀 Optimized for Next.js
- 🌍 Global CDN
- ✅ Good for: Static sites, Next.js apps

### Workaround for Backend Spin-Down
Use [UptimeRobot](https://uptimerobot.com) (free) to ping your backend every 5 minutes:
- Monitor Type: HTTP(s)
- URL: `https://your-backend.onrender.com`
- Interval: 5 minutes

---

## Quick Reference

### Backend Commands (Render Shell)
```bash
# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Check database
npx prisma studio
```

### Frontend Redeploy (After Backend URL Change)
1. Update environment variables in Vercel
2. Go to Deployments
3. Click "⋯" → Redeploy

---

## Environment Variables Summary

### Backend (Render)
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-32-char-secret-here
JWT_REFRESH_SECRET=your-32-char-refresh-secret
PORT=3001
NODE_ENV=production
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://your-backend.onrender.com
```

---

## Troubleshooting

### Backend Issues
**Problem**: Build fails with "nest: not found"
**Solution**: Already fixed! Latest code includes fix.

**Problem**: Database connection error
**Solution**: Use Internal Database URL from Render, not External

**Problem**: Migrations not applied
**Solution**: Run `npx prisma migrate deploy` in Render Shell

### Frontend Issues
**Problem**: Can't connect to backend
**Solution**: 
- Verify `NEXT_PUBLIC_API_URL` is correct
- Make sure backend URL includes `https://`
- Redeploy frontend after changing env vars

**Problem**: CORS errors
**Solution**: Backend already configured for CORS. Check if backend URL is correct.

---

## Upgrading Plans

### When to Upgrade

**Render Backend** ($7/month):
- Remove spin-down delays
- Faster performance
- Better for production

**Render Database** ($7/month):
- No 90-day expiration
- Better performance
- Automatic backups

**Vercel Pro** ($20/month):
- More bandwidth
- Better analytics
- Team collaboration

### Total Monthly Cost
- **Free**: $0 (with limitations)
- **Basic Production**: $14-21/month
- **Full Production**: $34+/month

---

## Success! 🎉

Your OnlyFans platform is now live with:
- ✅ Backend on Render (with PostgreSQL)
- ✅ Frontend on Vercel (global CDN)
- ✅ Separated concerns for better performance
- ✅ Free to start, easy to scale

Visit your frontend URL and start testing!
