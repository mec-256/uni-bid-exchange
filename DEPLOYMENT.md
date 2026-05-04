# UniBid Exchange - Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (TanStack Start)                    │
│                    → Cloudflare Workers/Pages                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    API calls & WebSocket
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│              Backend (Express.js + Node.js)                      │
│              → Railway / Render / Vercel                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Services: Auth, Auctions, Bids, Wallet, Socket.io    │   │
│  │  Jobs: Auction Settlement (cron)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
        ┌─────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐
        │  MongoDB   │  │   Redis    │  │Cloudinary  │
        │  Atlas     │  │   Cloud    │  │ (Images)   │
        │            │  │            │  │            │
        └────────────┘  └────────────┘  └────────────┘
```

---

## Prerequisites & Setup

### 1. **Database (MongoDB Atlas)**
- Sign up: https://www.mongodb.com/cloud/atlas
- Create a free cluster (M0)
- Get connection string: `mongodb+srv://username:password@cluster...`
- Add your backend IP to whitelist (or allow 0.0.0.0 for testing)

### 2. **Cache (Redis Cloud)**
- Sign up: https://redis.com/cloud
- Create free instance
- Get connection string: `redis://default:password@host:port`

### 3. **File Storage (Cloudinary)**
- Sign up: https://cloudinary.com
- Create project
- Get: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### 4. **JWT Secret**
Generate a random string (min 32 characters):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Deployment Options

### **Option A: Railway (Recommended - Easiest)**

**Frontend:**
1. Push to GitHub
2. Go to railway.app → New Project
3. Deploy from GitHub repo
4. Set environment: `NODE_ENV=production`
5. Set domains

**Backend:**
1. Same repo/separate repo
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add env variables in Railway dashboard
5. Add MongoDB, Redis as Railway services (or use cloud providers)

---

### **Option B: Vercel + Render**

**Frontend (Vercel):**
- Connect GitHub repo
- Framework: TanStack Start
- Build: `npm run build`
- Deploy automatically on push

**Backend (Render):**
- New → Web Service
- Connect GitHub
- Build: `npm install && npm run build`
- Start: `npm start`
- Add environment variables
- Connect MongoDB Atlas & Redis Cloud

---

### **Option C: Docker + Self-Hosted (AWS EC2, DigitalOcean, etc.)**

Create a `Dockerfile` for the backend:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/dist ./dist

EXPOSE 5000
CMD ["npm", "start"]
```

---

## Step-by-Step Deployment (Railway Example)

### Backend Deployment

1. **Prepare code:**
   ```bash
   cd backend
   npm install
   npm run build
   ```

2. **Create `.env.production` with:**
   - `MONGODB_URI` (MongoDB Atlas)
   - `REDIS_URL` (Redis Cloud)
   - `JWT_SECRET` (generated)
   - `CLOUDINARY_*` (credentials)
   - `NODE_ENV=production`
   - `PORT=5000`

3. **Push to GitHub**

4. **Deploy on Railway:**
   - Select your repo
   - Build command: `npm run build`
   - Start command: `npm start`
   - Add all env variables
   - Deploy

5. **Get backend URL:** `https://your-railway-domain.up.railway.app`

### Frontend Deployment

1. **Update API endpoint** in [src/lib/api.ts](src/lib/api.ts):
   ```typescript
   const API_URL = process.env.VITE_API_URL || "https://your-backend-url";
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Deploy to Railway/Vercel:**
   - Set env: `VITE_API_URL=https://your-backend-url`
   - Deploy

---

## Pre-Deployment Checklist

- [ ] Backend has build script
- [ ] Backend has start script  
- [ ] `.env.production` created with all required vars
- [ ] MongoDB Atlas cluster created and connection tested
- [ ] Redis Cloud instance created
- [ ] Cloudinary project configured
- [ ] JWT secret generated (32+ characters)
- [ ] CORS configured for frontend domain in backend
- [ ] Socket.io CORS configured for frontend domain
- [ ] Frontend API endpoint points to backend domain
- [ ] Health check endpoint tested: `GET /health`
- [ ] Git repo ready to push

---

## Post-Deployment Testing

1. **Health check:**
   ```bash
   curl https://your-backend/health
   ```

2. **Test auth:**
   - POST `/api/auth/register`
   - POST `/api/auth/login`

3. **Test auctions:**
   - GET `/api/auctions`

4. **Test WebSocket:**
   - Check browser console for Socket.io connection

5. **Check logs:**
   - Railway: Deployments tab
   - Vercel: Logs section

---

## Environment Variables Needed

### Backend
```
MONGODB_URI=
JWT_SECRET=
PORT=5000
REDIS_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NODE_ENV=production
```

### Frontend
```
VITE_API_URL=https://your-backend-url
```

---

## Costs (Free Tier Compatible)

- **MongoDB Atlas**: Free (M0 - 512MB)
- **Redis Cloud**: Free (30MB)
- **Cloudinary**: Free (10GB storage)
- **Railway**: $5/month minimum (generous free credits)
- **Vercel**: Free tier available
- **Total**: $0-5/month to start

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check whitelist IP, connection string format |
| Redis connection fails | Verify URL format, check instance is running |
| CORS errors | Update backend CORS config with frontend domain |
| WebSocket not connecting | Check Socket.io CORS and backend domain |
| 502 Bad Gateway | Check backend logs, ensure port 5000 is exposed |
| Images not uploading | Verify Cloudinary credentials and API setup |

---

## Next Steps

1. Choose a deployment platform (Railway recommended)
2. Set up databases (MongoDB Atlas, Redis Cloud)
3. Set up Cloudinary project
4. Generate JWT secret
5. Add `.env.production` with all credentials
6. Push to GitHub
7. Connect and deploy on your platform
8. Test all endpoints
9. Monitor logs for errors

