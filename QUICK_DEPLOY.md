# 🚀 Scravo - Quick Deployment Guide

## 📌 TL;DR - Deploy in 30 Minutes

### Step 1: MongoDB Atlas (5 minutes)
1. Go to https://mongodb.com/atlas → Sign up
2. Create FREE M0 cluster
3. Create database user + password
4. Network Access → Allow 0.0.0.0/0
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/scravo?retryWrites=true&w=majority`

### Step 2: Deploy Backend to Render (10 minutes)
1. Go to https://render.com → Sign up with GitHub
2. New Web Service → Connect your repo
3. Settings:
   - Build: `cd backend && npm install`
   - Start: `cd backend && npm start`
4. Environment Variables:
   ```
   MONGODB_URI=<your-atlas-connection-string>
   JWT_SECRET=any-random-long-string-here-123456
   NODE_ENV=production
   PORT=5000
   ```
5. Deploy → Save URL: `https://scravo-backend.onrender.com`

### Step 3: Deploy Frontend to Vercel (10 minutes)
1. Go to https://vercel.com → Sign up with GitHub
2. Import your repo
3. Settings:
   - Root Directory: `frontend`
   - Framework: Vite
4. Environment Variable:
   ```
   VITE_API_URL=https://scravo-backend.onrender.com/api
   ```
5. Deploy → Save URL: `https://scravo.vercel.app`

### Step 4: Update Backend CORS (5 minutes)
1. Back to Render → Your backend service
2. Add environment variable:
   ```
   FRONTEND_URL=https://scravo.vercel.app
   ```
3. Save (auto-redeploys)

### Step 5: Test! 🎉
Visit your frontend URL and:
- ✅ Register a user
- ✅ Create a listing
- ✅ Browse marketplace

---

## 📝 Important URLs to Save

After deployment, document these for your report:

```
Frontend (Production): https://_________________.vercel.app
Backend API:           https://_________________.onrender.com
Database:              MongoDB Atlas (Connection String in Render env)
```

---

## 🎓 For Academic Submission

### SDLC Deployment Phase Documentation

**Deployment Architecture:**
```
Internet Users
      ↓
[Vercel CDN] → React Frontend (Static Files)
      ↓
   HTTPS API Calls
      ↓
[Render Server] → Node.js/Express Backend
      ↓
  MongoDB Driver
      ↓
[MongoDB Atlas] → Cloud Database
```

**Technologies Used:**
- **Frontend Hosting**: Vercel (CDN, Global distribution)
- **Backend Hosting**: Render (Container-based deployment)
- **Database**: MongoDB Atlas (Cloud-managed NoSQL)
- **CI/CD**: Automatic deployment on git push

**Screenshots Needed:**
1. Live application homepage
2. User registration/login
3. Marketplace with listings
4. Order creation flow
5. Render dashboard showing deployment
6. Vercel dashboard showing deployment
7. MongoDB Atlas showing database

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend 503 error | Wait 30s (free tier cold start) |
| CORS error | Check FRONTEND_URL in Render |
| Can't login | Check MongoDB connection in Render logs |
| API calls fail | Verify VITE_API_URL in Vercel |

---

## 📚 Full Documentation

- **Complete Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Detailed Checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

## ⚡ Verification Script

After deployment, test everything:

```bash
./verify-deployment.sh https://your-backend.onrender.com https://your-frontend.vercel.app
```

---

## 💡 Pro Tips

1. **Before Demo**: Access your backend 2 minutes before presenting to warm it up
2. **Screenshots**: Take them immediately - free tier can be unpredictable
3. **Backup Plan**: Have local version ready just in case
4. **Cold Start**: Mention "30-second cold start due to free tier" if there's delay

---

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ Frontend loads from Vercel URL
- ✅ Can register and login
- ✅ Can create listings
- ✅ Can browse marketplace
- ✅ Data persists in MongoDB Atlas

---

**Estimated Total Time**: 30-45 minutes  
**Cost**: $0 (All free tiers)  
**Perfect for**: Academic projects, demos, portfolios

Good luck with your Software Engineering project! 🚀
