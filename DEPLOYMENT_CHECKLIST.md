# ✅ Deployment Checklist

## Backend on Render

### Database Setup
- [ ] Create PostgreSQL database on Render
- [ ] Copy Internal Database URL
- [ ] Database region selected (Oregon recommended)

### Backend Service
- [ ] Create Web Service on Render
- [ ] Connected GitHub repository
- [ ] Set Root Directory: `backend`
- [ ] Build Command: `npm install && npx nest build && npx prisma generate`
- [ ] Start Command: `npm run start:prod`
- [ ] Environment variables added:
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET (32+ characters)
  - [ ] JWT_REFRESH_SECRET (32+ characters)
  - [ ] PORT=3001
  - [ ] NODE_ENV=production
- [ ] Service deployed successfully
- [ ] Copy backend URL: `https://______________.onrender.com`

### Database Migrations
- [ ] Open Shell in Render backend service
- [ ] Run: `npx prisma migrate deploy`
- [ ] Run: `npx prisma db seed` (optional)
- [ ] Verify database has data

---

## Frontend on Vercel

### Vercel Service
- [ ] Create new project on Vercel
- [ ] Connected GitHub repository
- [ ] Set Root Directory: `frontend`
- [ ] Framework: Next.js (auto-detected)
- [ ] Environment variables added:
  - [ ] NEXT_PUBLIC_API_URL=`https://your-backend.onrender.com`
  - [ ] NEXT_PUBLIC_WS_URL=`wss://your-backend.onrender.com`
- [ ] Service deployed successfully
- [ ] Copy frontend URL: `https://______________.vercel.app`

---

## Testing

### Backend Health Check
- [ ] Visit backend URL
- [ ] See "API is running" or health check response
- [ ] No errors in Render logs

### Frontend
- [ ] Visit frontend URL
- [ ] Homepage loads correctly
- [ ] No console errors

### User Registration
- [ ] Register new user works
- [ ] Email validation works
- [ ] Age verification appears
- [ ] Redirects to feed after verification

### Authentication
- [ ] Login works
- [ ] JWT tokens are set
- [ ] Protected routes work
- [ ] Logout works

### Creator Features
- [ ] Can become creator
- [ ] Can upload posts
- [ ] Posts appear in feed
- [ ] Can edit/delete posts

### Payments (if configured)
- [ ] Can subscribe to creator
- [ ] Can unlock PPV posts
- [ ] Transactions recorded

---

## Optional Enhancements

### Backend (Render)
- [ ] Set up UptimeRobot to prevent spin-down
- [ ] Enable auto-deploy on push
- [ ] Configure custom domain
- [ ] Set up database backups (paid plan)

### Frontend (Vercel)
- [ ] Enable auto-deploy on push
- [ ] Configure custom domain
- [ ] Set up analytics
- [ ] Enable preview deployments

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up database monitoring
- [ ] Enable performance monitoring

---

## Post-Deployment

- [ ] Update README with live URLs
- [ ] Test all features thoroughly
- [ ] Document any issues
- [ ] Plan for scaling if needed
- [ ] Consider upgrading to paid plans

---

## Quick Commands Reference

### Generate JWT Secrets
```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### Check Backend Logs (Render)
Dashboard → Backend Service → Logs

### Redeploy Frontend (Vercel)
Dashboard → Project → Deployments → Redeploy

### Run Migrations (Render Shell)
```bash
npx prisma migrate deploy
```

---

## Troubleshooting

### Backend not responding
1. Check Render logs
2. Verify environment variables
3. Restart service
4. Check database connection

### Frontend can't connect
1. Verify NEXT_PUBLIC_API_URL is correct
2. Check CORS in backend logs
3. Redeploy frontend after env var changes
4. Check browser console for errors

### Database issues
1. Use Internal Database URL (not External)
2. Run migrations in Render Shell
3. Check database status in Render

---

## Success Criteria

✅ Backend deployed and running on Render
✅ Database created and migrated
✅ Frontend deployed and running on Vercel
✅ Users can register and login
✅ Creators can upload content
✅ Posts appear in feed
✅ All core features working

## 🎉 You're Live!

Frontend: https://__________________.vercel.app
Backend: https://__________________.onrender.com

---

**Need Help?** Check the full guides:
- [HYBRID_DEPLOY.md](./HYBRID_DEPLOY.md) - Complete hybrid deployment guide
- [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) - Render-specific details
- [DEPLOYMENT.md](./DEPLOYMENT.md) - General deployment info
