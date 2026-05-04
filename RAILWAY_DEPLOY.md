# 🚀 Railway Deployment Guide - UniBid Exchange

## Step 1: Create External Services (5 min)

### 1a. MongoDB Atlas
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up → Create a free account
3. Create a project → Build a Cluster → Select M0 (free)
4. Create database user (e.g., admin / strong-password)
5. Network Access → Add IP → Allow 0.0.0.0/0 (or add your IP)
6. Click "Connect" → "Drivers" → Copy connection string
   - Format: `mongodb+srv://admin:password@cluster.mongodb.net/unibid-exchange`
7. **Save this** → `MONGODB_URI`

### 1b. Redis Cloud
1. Go to https://redis.com/cloud
2. Sign up → Create free account
3. Create Subscription → Fixed plan → Free tier
4. Get connection string from database view
   - Format: `redis://default:password@host:port`
5. **Save this** → `REDIS_URL`

### 1c. Cloudinary
1. Go to https://cloudinary.com
2. Sign up → Create account
3. Dashboard → Copy:
   - Cloud Name
   - API Key
   - API Secret
4. **Save these** → `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### 1d. Generate JWT Secret
Run this in terminal:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**Save this** → `JWT_SECRET`

---

## Step 2: Update Environment Variables

Edit `.env.production` in the root:

```
MONGODB_URI=mongodb+srv://admin:password@cluster.mongodb.net/unibid-exchange
JWT_SECRET=your-generated-secret-here
PORT=5000
REDIS_URL=redis://default:password@host:port
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
```

---

## Step 3: Push to GitHub

```powershell
# Initialize git if not already done
git init
git add .
git commit -m "Ready for deployment"
git branch -M main

# Create repo on GitHub and add remote
git remote add origin https://github.com/YOUR-USERNAME/uni-bid-exchange.git
git push -u origin main
```

---

## Step 4: Deploy to Railway

### 4a. Deploy Backend First

1. Go to **railway.app** → Sign up (or sign in)
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select your repo `uni-bid-exchange`
4. Add a service:
   - Service: **Backend**
   - Root directory: `backend`
5. Configure build:
   - Build command: `npm run build`
   - Start command: `npm start`
6. Add environment variables:
   - Go to Variables tab
   - Add all from `.env.production`:
     ```
     MONGODB_URI=...
     JWT_SECRET=...
     REDIS_URL=...
     CLOUDINARY_CLOUD_NAME=...
     CLOUDINARY_API_KEY=...
     CLOUDINARY_API_SECRET=...
     NODE_ENV=production
     PORT=5000
     ```
7. **Deploy** ✅

Get the backend URL (e.g., `https://uni-bid-exchange-prod-xxx.up.railway.app`)

### 4b. Deploy Frontend

1. In Railway dashboard → **Add service** → **New from GitHub** (same repo)
2. Configure:
   - Service: **Frontend**
   - Root directory: `.` (root of repo)
3. Build settings:
   - Build command: `npm run build`
   - Start command: `npm start` (or `npx http-server dist`)
4. Environment variables:
   ```
   VITE_API_URL=https://YOUR-BACKEND-URL.up.railway.app
   ```
5. **Deploy** ✅

---

## Step 5: Test Your App

1. Open frontend URL from Railway dashboard
2. Test auth:
   - Register → Login
3. Test auctions
4. Check browser console for WebSocket errors

---

## Environment Variables Checklist

### Backend needs:
- [ ] `MONGODB_URI` (MongoDB Atlas)
- [ ] `REDIS_URL` (Redis Cloud)
- [ ] `JWT_SECRET` (generated)
- [ ] `CLOUDINARY_CLOUD_NAME` (Cloudinary)
- [ ] `CLOUDINARY_API_KEY` (Cloudinary)
- [ ] `CLOUDINARY_API_SECRET` (Cloudinary)
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`

### Frontend needs:
- [ ] `VITE_API_URL` (your backend URL from Railway)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails | Check logs in Railway → Deployments tab |
| MongoDB connection fails | Check whitelist IP in Atlas, verify connection string |
| Redis connection fails | Verify Redis URL format, check if service is running |
| WebSocket not connecting | Check `VITE_API_URL` in frontend, verify backend URL |
| 502 error | Check backend logs, ensure all env vars are set |
| Images not uploading | Verify Cloudinary credentials, check API keys |

---

## Quick Command Reference

```powershell
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Build backend locally
cd backend
npm run build

# Build frontend locally
npm run build

# Test locally before deploying
npm run dev  # in root (both frontend and backend)
```

---

## Success Indicators ✅

1. Backend URL is accessible: `curl https://your-backend-url/health`
2. Frontend loads without errors
3. Can register and login
4. Can create auctions
5. WebSocket connects (check browser console)
6. Bids update in real-time

---

## Next Steps After Deployment

1. Monitor Railway logs for errors
2. Set up custom domain (Railway → Domain settings)
3. Enable auto-deploy on GitHub push (Railway does this by default)
4. Set up email notifications for deployment failures

