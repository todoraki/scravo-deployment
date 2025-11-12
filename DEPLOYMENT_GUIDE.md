# 🚀 Scravo Deployment Guide

This guide covers deploying your Scravo marketplace application for public access. Perfect for demonstrating the complete Software Development Life Cycle (SDLC) deployment phase.

## 📋 Overview

We'll deploy:
- **Backend (Node.js/Express)** → Render/Railway (Free tier)
- **Frontend (React/Vite)** → Vercel/Netlify (Free tier)
- **Database (MongoDB)** → MongoDB Atlas (Free tier)

**Total Cost**: $0 (Free tier services)

---

## 🎯 Recommended Deployment Stack

### Option 1: Best for Academic Projects (Recommended)
- **Backend**: Render (https://render.com)
- **Frontend**: Vercel (https://vercel.com)
- **Database**: MongoDB Atlas (https://mongodb.com/atlas)

### Option 2: All-in-one Alternative
- **Backend**: Railway (https://railway.app)
- **Frontend**: Vercel (https://vercel.com)
- **Database**: MongoDB Atlas (https://mongodb.com/atlas)

---

## 📦 Phase 1: Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email (or use Google/GitHub)
3. Choose the **FREE M0 cluster** (512 MB storage)

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose **M0 FREE** tier
3. Select a cloud provider and region (choose closest to your users)
4. Name your cluster (e.g., "scravo-cluster")
5. Click "Create"

### Step 3: Setup Database Access
1. Go to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Setup Network Access
1. Go to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Note: For production, restrict this to specific IPs
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to **Database** → Click "Connect"
2. Choose "Connect your application"
3. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/scravo?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your credentials
5. Replace the database name from `myFirstDatabase` to `scravo`

**Example**:
```
mongodb+srv://scravo_admin:MySecurePass123@scravo-cluster.abc123.mongodb.net/scravo?retryWrites=true&w=majority
```

---

## 🔧 Phase 2: Backend Deployment (Render)

### Step 1: Prepare Backend Code

1. Create a `package.json` start script (should already exist):
   ```json
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }
   ```

2. Ensure `server.js` uses environment PORT:
   ```javascript
   const PORT = process.env.PORT || 5000;
   ```

### Step 2: Deploy to Render

1. Go to https://render.com and sign up (use GitHub)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `scravo-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

5. Add Environment Variables:
   - Click "Advanced" → "Add Environment Variable"
   - Add these variables:
   
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/scravo?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

6. Click "Create Web Service"

7. Wait 5-10 minutes for deployment

8. **Save your backend URL**: `https://scravo-backend.onrender.com`

### Important Notes:
- Free tier on Render spins down after 15 minutes of inactivity
- First request after inactivity takes ~30 seconds (cold start)
- Perfect for demos and academic projects

---

## 🎨 Phase 3: Frontend Deployment (Vercel)

### Step 1: Update API URL

1. Update `frontend/src/utils/api.js`:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'https://scravo-backend.onrender.com/api';
   ```

2. Create `frontend/.env.production`:
   ```
   VITE_API_URL=https://scravo-backend.onrender.com/api
   ```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign up (use GitHub)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://scravo-backend.onrender.com/api
   ```

6. Click "Deploy"

7. Wait 2-3 minutes for deployment

8. **Your app is live!** Example: `https://scravo.vercel.app`

---

## 🔄 Phase 4: Update Backend CORS

After frontend deployment, update backend CORS settings:

1. Go to Render Dashboard → Your Backend Service
2. Update `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://scravo.vercel.app
   ```

3. Ensure `server.js` has CORS configured:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
     credentials: true
   }));
   ```

---

## 🧪 Testing Your Deployment

1. **Test Backend**:
   - Visit: `https://scravo-backend.onrender.com/api/health`
   - Should return: `{"status": "ok"}`

2. **Test Frontend**:
   - Visit: `https://scravo.vercel.app`
   - Try registering a new user
   - Create a listing
   - Browse marketplace

3. **Test Database**:
   - Check MongoDB Atlas dashboard
   - View collections and documents
   - Monitor connection activity

---

## 📱 Alternative: Deploy to Railway

### Backend on Railway

1. Go to https://railway.app and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - **Root Directory**: `/backend`
   - **Start Command**: `npm start`

5. Add Environment Variables (same as Render)

6. Railway provides a URL: `https://scravo-backend.up.railway.app`

**Advantages**:
- No cold starts (stays active)
- Better free tier performance
- Built-in PostgreSQL if needed

**Limitations**:
- Free tier: $5 credit/month (usually enough for demos)

---

## 🎓 For Your Academic Presentation

### SDLC Deployment Phase Documentation

Include these in your project report:

1. **Deployment Architecture Diagram**:
   ```
   [Users] → [Vercel CDN] → [React Frontend]
                ↓
           [API Calls]
                ↓
   [Render Server] → [Node.js Backend] → [MongoDB Atlas]
   ```

2. **Deployment Checklist**:
   - ✅ Database hosted on MongoDB Atlas (Cloud)
   - ✅ Backend API hosted on Render (Serverless)
   - ✅ Frontend hosted on Vercel (CDN)
   - ✅ Environment variables configured
   - ✅ CORS and security configured
   - ✅ Production build optimized
   - ✅ Monitoring and logs enabled

3. **Live URLs to Include**:
   - Production URL: `https://scravo.vercel.app`
   - API Endpoint: `https://scravo-backend.onrender.com`
   - Database: MongoDB Atlas (Connection string in env)

4. **Screenshots to Take**:
   - Render deployment dashboard
   - Vercel deployment dashboard
   - MongoDB Atlas cluster overview
   - Live application running
   - User registration and login
   - Marketplace functionality

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** (already in `.gitignore`)
2. Use strong JWT secrets (random 64+ character strings)
3. In MongoDB Atlas, restrict IP access to known IPs (not 0.0.0.0/0)
4. Enable HTTPS only (automatic with Vercel/Render)
5. Set secure cookie options in production
6. Rate limit API endpoints (add express-rate-limit)

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: API not responding
- Check Render logs: Dashboard → Logs tab
- Verify environment variables are set
- Check MongoDB connection string

**Problem**: CORS errors
- Update `FRONTEND_URL` in Render
- Verify CORS middleware in `server.js`

### Frontend Issues

**Problem**: API calls failing
- Check `VITE_API_URL` in Vercel settings
- Verify backend URL is correct and live
- Check browser console for errors

**Problem**: Build fails
- Check build logs in Vercel
- Verify all dependencies in `package.json`
- Test build locally: `npm run build`

### Database Issues

**Problem**: Can't connect to MongoDB
- Verify connection string is correct
- Check Network Access (0.0.0.0/0 allowed)
- Verify database user credentials

---

## 💰 Cost Breakdown

All services offer free tiers perfect for academic projects:

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **MongoDB Atlas** | M0 Cluster | 512 MB storage, Shared CPU |
| **Render** | Free Plan | 750 hours/month, Spins down after 15min |
| **Vercel** | Hobby Plan | 100 GB bandwidth, Unlimited sites |

**Total**: $0/month for your project demo

---

## 📊 Monitoring Your Deployment

1. **Render Dashboard**: View logs, metrics, restart service
2. **Vercel Dashboard**: Analytics, deployments, preview URLs
3. **MongoDB Atlas**: Monitor connections, storage, queries

---

## 🚀 Quick Deploy Commands

After setup, redeploy with:

```bash
# Backend (automatic on git push if connected to GitHub)
git add .
git commit -m "Update backend"
git push origin main

# Frontend (automatic on git push if connected to GitHub)
git add .
git commit -m "Update frontend"
git push origin main
```

Both Vercel and Render auto-deploy on git push!

---

## 📝 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [MERN Stack Deployment](https://www.mongodb.com/languages/mern-stack-tutorial)

---

## ✅ Final Checklist

Before your presentation:

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Backend deployed to Render and running
- [ ] Frontend deployed to Vercel and accessible
- [ ] Environment variables configured correctly
- [ ] CORS enabled for frontend URL
- [ ] Test user registration works
- [ ] Test listing creation works
- [ ] Test marketplace browsing works
- [ ] Take screenshots of all dashboards
- [ ] Document deployment architecture
- [ ] Prepare live demo

---

**Good luck with your Software Engineering project! 🎉**

If you encounter any issues, check the logs in each service's dashboard.
