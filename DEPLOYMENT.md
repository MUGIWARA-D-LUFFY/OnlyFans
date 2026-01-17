# OnlyFans Platform - Vercel Deployment Guide

## Prerequisites
1. GitHub account with your code pushed
2. Vercel account (free tier available)
3. PostgreSQL database (Vercel Postgres, Supabase, or Railway)

## Step-by-Step Deployment

### 1. Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### 2. Deploy via Vercel Dashboard (Recommended)

#### A. Frontend Deployment
1. Go to https://vercel.com/new
2. Import your GitHub repository: `MUGIWARA-D-LUFFY/OnlyFans`
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
   NEXT_PUBLIC_WS_URL=wss://your-backend.vercel.app
   ```

5. Click "Deploy"

#### B. Backend Deployment
1. Go to https://vercel.com/new
2. Import the same repository again
3. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build && npx prisma generate`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add Environment Variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
   PORT=3001
   NODE_ENV=production
   ```

5. Click "Deploy"

### 3. Database Setup

#### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Click on your backend project
3. Go to "Storage" tab
4. Create new Postgres database
5. Copy the DATABASE_URL
6. Add it to your backend environment variables

#### Option B: Supabase (Free Alternative)
1. Sign up at https://supabase.com
2. Create new project
3. Go to Settings > Database
4. Copy connection string (connection pooling mode)
5. Add it as DATABASE_URL in Vercel

#### Option C: Railway.app (Another Alternative)
1. Sign up at https://railway.app
2. Create new PostgreSQL database
3. Copy connection string
4. Add it as DATABASE_URL in Vercel

### 4. Run Database Migrations
After deploying backend with DATABASE_URL:

```bash
# Install Vercel CLI if not already
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
cd backend
vercel link

# Run migrations
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed
```

Or use Vercel CLI in your local terminal:
```bash
# Pull environment variables
vercel env pull

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run prisma:seed
```

### 5. Update Frontend API URL
1. Go to your frontend project in Vercel
2. Settings > Environment Variables
3. Update `NEXT_PUBLIC_API_URL` with your backend URL
4. Redeploy frontend

### 6. Configure CORS
The backend is already configured to accept requests from any origin in production.
If you need to restrict it, update `backend/src/main.ts`:

```typescript
app.enableCors({
  origin: ['https://your-frontend.vercel.app'],
  credentials: true,
});
```

## Alternative: Deploy via Vercel CLI

### Frontend
```bash
cd frontend
vercel --prod
```

### Backend
```bash
cd backend
vercel --prod
```

## Environment Variables Checklist

### Frontend (.env.local)
- [ ] NEXT_PUBLIC_API_URL
- [ ] NEXT_PUBLIC_WS_URL

### Backend (.env)
- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] JWT_REFRESH_SECRET
- [ ] PORT
- [ ] NODE_ENV

## Post-Deployment Testing

1. Visit your frontend URL
2. Test user registration
3. Test login
4. Test creator features
5. Test payments (in test mode initially)
6. Check error logs in Vercel dashboard

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all dependencies are in package.json
- Verify environment variables are set

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if database allows connections from Vercel IPs
- Run `npx prisma migrate deploy`

### API Not Responding
- Check backend logs in Vercel
- Verify NEXT_PUBLIC_API_URL points to backend
- Check CORS configuration

### WebSocket Issues
- Ensure NEXT_PUBLIC_WS_URL uses wss:// protocol
- Check if Vercel supports WebSockets (it does with limitations)
- Consider using Socket.io polling as fallback

## Useful Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Remove deployment
vercel rm [deployment-name]

# Add environment variable
vercel env add [name]

# Pull environment variables
vercel env pull
```

## Production Checklist

- [ ] Frontend deployed
- [ ] Backend deployed
- [ ] Database configured
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Database seeded (optional)
- [ ] CORS configured
- [ ] DNS/Domain configured (optional)
- [ ] SSL enabled (automatic on Vercel)
- [ ] Error monitoring setup
- [ ] Backup strategy implemented

## Custom Domain (Optional)

1. Go to your Vercel project
2. Settings > Domains
3. Add your custom domain
4. Update DNS records as instructed
5. SSL certificate is automatic

## Monitoring & Logs

- View logs: Vercel Dashboard > Your Project > Logs
- Analytics: Vercel Dashboard > Your Project > Analytics
- Error tracking: Consider integrating Sentry

## Cost Considerations

- Vercel Free Tier: Suitable for hobby projects
- Hobby Plan: $20/month per member
- Pro Plan: $20/month + usage
- Database costs: Varies by provider

## Support & Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- NestJS Docs: https://docs.nestjs.com
- Prisma Docs: https://www.prisma.io/docs

## Notes

- Vercel has serverless function timeout limits (10s on Hobby, 60s on Pro)
- Consider separating long-running tasks
- Use Vercel Edge Functions for better performance
- Monitor usage to avoid unexpected costs
