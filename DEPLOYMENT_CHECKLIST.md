# 🎓 Quick Deployment Checklist

## Before You Start
- [ ] GitHub account created
- [ ] Git repository pushed to GitHub
- [ ] MongoDB Atlas account ready
- [ ] Render account ready
- [ ] Vercel account ready

## Phase 1: Database (MongoDB Atlas)
- [ ] Created free M0 cluster
- [ ] Created database user with password
- [ ] Added network access (0.0.0.0/0 or specific IPs)
- [ ] Copied connection string
- [ ] Replaced username and password in connection string
- [ ] Connection string format: `mongodb+srv://username:password@cluster.mongodb.net/scravo?retryWrites=true&w=majority`

## Phase 2: Backend (Render)
- [ ] Connected GitHub repository to Render
- [ ] Created new Web Service
- [ ] Set build command: `cd backend && npm install`
- [ ] Set start command: `cd backend && npm start`
- [ ] Added environment variables:
  - [ ] `MONGODB_URI` (from MongoDB Atlas)
  - [ ] `JWT_SECRET` (random secure string)
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `FRONTEND_URL` (will add after frontend deployment)
- [ ] Deployed successfully
- [ ] Saved backend URL (e.g., `https://scravo-backend.onrender.com`)
- [ ] Tested health endpoint: `https://your-backend.onrender.com/health`

## Phase 3: Frontend (Vercel)
- [ ] Connected GitHub repository to Vercel
- [ ] Set root directory to `frontend`
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Added environment variable:
  - [ ] `VITE_API_URL` (your backend URL + `/api`)
- [ ] Deployed successfully
- [ ] Saved frontend URL (e.g., `https://scravo.vercel.app`)

## Phase 4: Final Configuration
- [ ] Updated `FRONTEND_URL` in Render backend settings
- [ ] Redeployed backend (may happen automatically)
- [ ] Tested CORS by accessing frontend
- [ ] Verified API calls work from frontend

## Phase 5: Testing
- [ ] Visited frontend URL
- [ ] Registered new user account
- [ ] Logged in successfully
- [ ] Created a test listing
- [ ] Browsed marketplace
- [ ] Placed a test order
- [ ] Checked admin panel (if admin user)

## Phase 6: Documentation for Submission
- [ ] Took screenshot of live application
- [ ] Took screenshot of Render dashboard
- [ ] Took screenshot of Vercel dashboard
- [ ] Took screenshot of MongoDB Atlas
- [ ] Documented live URLs:
  - Frontend: ___________________________
  - Backend API: ________________________
- [ ] Created deployment architecture diagram
- [ ] Prepared demo for presentation

## Troubleshooting Commands

### Check Backend Status
```bash
curl https://your-backend.onrender.com/health
curl https://your-backend.onrender.com/api/test
```

### Verify Deployment
```bash
./verify-deployment.sh https://your-backend.onrender.com https://your-frontend.vercel.app
```

### View Logs
- **Render**: Dashboard → Your Service → Logs tab
- **Vercel**: Dashboard → Your Project → Deployments → View Logs
- **MongoDB Atlas**: Database → Browse Collections

## Common Issues

### ❌ Backend: "Cannot connect to MongoDB"
- Check connection string format
- Verify username and password
- Check network access in MongoDB Atlas
- Wait 2-3 minutes for Atlas to provision

### ❌ Frontend: "Network Error" or "CORS Error"
- Verify `VITE_API_URL` is set correctly
- Check `FRONTEND_URL` is set in backend
- Ensure backend is running (check Render status)
- Wait 30 seconds for Render cold start

### ❌ "JWT malformed" or "401 Unauthorized"
- Check JWT_SECRET is set in backend
- Try logging out and logging in again
- Clear browser localStorage

### ❌ Render: "503 Service Unavailable"
- Free tier spins down after 15 min
- Wait 30 seconds for cold start
- Check build logs for errors

## Important Notes

✅ **Free Tier Limitations:**
- Render: Spins down after 15 minutes of inactivity
- First request after spin down takes ~30 seconds
- MongoDB Atlas: 512 MB storage limit

✅ **For Academic Demo:**
- Keep backend "warmed up" by accessing it before demo
- Have screenshots ready in case of cold start
- Mention cold start is due to free tier

✅ **Security for Production:**
- Use strong passwords
- Restrict MongoDB IP access
- Add rate limiting
- Enable HTTPS only (automatic on Vercel/Render)

## Resources
- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)

---

**Need Help?** Check logs in each service's dashboard or refer to the troubleshooting section in DEPLOYMENT_GUIDE.md
