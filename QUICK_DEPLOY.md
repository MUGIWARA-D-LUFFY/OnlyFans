# 🚀 Quick Vercel Deployment

## One-Click Deploy (Easiest Method)

### Step 1: Deploy Frontend
1. Go to [Vercel](https://vercel.com/new)
2. Import repository: `MUGIWARA-D-LUFFY/OnlyFans`
3. Settings:
   - Framework: **Next.js**
   - Root Directory: **`frontend`**
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add Environment Variables (add after first deploy):
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
   NEXT_PUBLIC_WS_URL=wss://your-backend.vercel.app
   ```
5. Click **Deploy** ✅

### Step 2: Setup Database
Choose one option:

**Option A: Vercel Postgres** (Easiest)
1. In Vercel Dashboard → Storage → Create Database
2. Copy `DATABASE_URL`

**Option B: Supabase** (Free)
1. Sign up at [supabase.com](https://supabase.com)
2. Create project → Settings → Database
3. Copy connection string (Pooling mode)

**Option C: Railway**
1. Sign up at [railway.app](https://railway.app)
2. New Project → PostgreSQL
3. Copy connection string

### Step 3: Deploy Backend
1. Go to [Vercel](https://vercel.com/new) again
2. Import same repository: `MUGIWARA-D-LUFFY/OnlyFans`
3. Settings:
   - Framework: **Other**
   - Root Directory: **`backend`**
   - Build Command: `npm run build && npx prisma generate`
   - Output Directory: `dist`
4. Add Environment Variables:
   ```
   DATABASE_URL=your_database_connection_string_from_step_2
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-at-least-32-chars
   PORT=3001
   NODE_ENV=production
   ```
5. Click **Deploy** ✅

### Step 4: Update Frontend URL
1. Copy your backend URL (e.g., `https://your-backend.vercel.app`)
2. Go to Frontend project → Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` with backend URL
4. Redeploy frontend

### Step 5: Run Database Migrations
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Navigate to backend
cd backend

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

## ✅ Done!

Visit your frontend URL and test:
- User registration
- Login
- Creator features
- Post creation

## 📝 Important URLs

After deployment, note these:
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-backend.vercel.app`
- Database: Check your database provider dashboard

## 🔧 Troubleshooting

**Build Failed?**
- Check Vercel logs
- Verify all environment variables are set

**Can't connect to database?**
- Verify DATABASE_URL is correct
- Run `npx prisma migrate deploy`

**API not working?**
- Check backend logs
- Verify NEXT_PUBLIC_API_URL points to backend

## 📚 More Details

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide.

## 💡 Tips

- Use strong JWT secrets (generate with: `openssl rand -base64 32`)
- Monitor your Vercel usage
- Set up custom domain in Vercel settings
- Enable error monitoring
