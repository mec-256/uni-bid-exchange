# UniBid Exchange — End-to-End Backend Plan

---

## Project Structure

```
uni-bid-exchange/
├── frontend/        ← your existing React app
└── backend/
    ├── src/
    │   ├── config/        db.ts, env.ts, cloudinary.ts
    │   ├── models/        User, Auction, Bid, Wallet, Transaction, Review
    │   ├── routes/        auth, auctions, bids, wallet, users, recommendations
    │   ├── services/      AuctionService, WalletService, AuthService, RecommendService
    │   ├── middleware/    authGuard, rateLimiter, validate, errorHandler
    │   ├── sockets/       bidHandler, notificationHandler
    │   ├── jobs/          settleExpired.ts (cron)
    │   └── app.ts
    ├── .env
    └── package.json
```

---

## Phase 1 — Foundation (Days 1–2)

**Setup:** `npm init`, install `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `zod`, `cors`, `dotenv`, `socket.io`. Use TypeScript throughout (`ts-node-dev` for dev).

### MongoDB Models

Directly mirror your existing `types.ts`:

- **User** — fullName, studentId, email (unique), passwordHash, university, trustScore, avatarUrl, bio, createdAt
- **Auction** — all existing fields + index on `status` + `endsAt` for the cron job
- **Bid** — auctionId (ref), userId (ref), amount, createdAt — index on `auctionId`
- **Wallet** — one document per user, embedded balance/held/totalDeposited/totalSpent
- **Transaction** — userId (ref), type, amount, description, status, createdAt
- **Review** — sellerId (ref), reviewerId (ref), rating, text, createdAt

### Auth Endpoints (`/api/auth`)

- `POST /register` — validate Mahindra University email regex, bcrypt password, create user + starter wallet (500 Unicoins), return JWT
- `POST /login` — verify credentials, return JWT + user object
- `GET /me` — return current user from token

**JWT middleware:** `authGuard.ts` verifies the Bearer token on protected routes and attaches `req.user`.

---

## Phase 2 — Core API (Days 3–5)

### Auctions (`/api/auctions`)

- `GET /` — list active auctions, supports `?category=&q=&sort=` query params
- `GET /:id` — single auction with bid history
- `POST /` — create auction (auth required), upload images to Cloudinary via signed URL
- `PATCH /:id` — edit own auction (before any bids)

### Bids (`/api/bids`)

- `POST /` — place bid: validate minimum amount, check wallet balance, hold funds, update auction's `currentBid` and `bidCount`, emit Socket.IO event to the auction room, record transaction. Use a Redis lock (`SET auction:lock:<id> NX EX 5`) to prevent race conditions when two people bid simultaneously.

### Wallet (`/api/wallet`)

- `GET /` — return wallet + paginated transactions
- `POST /buy` — add Unicoins (mock Razorpay/Stripe webhook in dev)
- `POST /withdraw` — deduct Unicoins (mock)

### Users / Profile (`/api/users`)

- `GET /:id` — public profile, listings, reviews
- `PATCH /me` — update fullName, bio, avatarUrl
- `POST /me/password` — change password
- `GET /me/bids` — my active and historical bids
- `GET /me/listings` — my auction listings

### Settings (`/api/users/me/prefs`)

- `GET /` and `PATCH /` — notification preferences object (maps 1:1 to your existing `NotificationPrefs` type)

---

## Phase 3 — Real-time & Auction Settlement (Days 6–7)

### Socket.IO Setup

- Client joins a room per auction: `socket.join('auction:' + auctionId)`
- When a bid lands, emit `bid:new` to the room with the updated bid + new `currentBid`
- Emit `auction:ended` when settlement fires, with winner info
- Emit `outbid` to the previous highest bidder's personal room

### Cron Job

Use `node-cron` or `agenda`. Runs every 30 seconds — finds all auctions where `status = 'active'` and `endsAt <= now`. For each: finds top bid, transfers held funds from winner's wallet to seller's wallet, marks auction `sold` or `expired`, creates settlement transactions, emits `auction:ended` via Socket.IO.

This replaces your `settleExpired()` mock — same logic, real persistence.

---

## Phase 4 — Frontend Integration (Days 8–9)

Replace all calls in `src/lib/api.ts` with real `fetch` calls to your Express backend. Your API file is already well-structured for this — just swap `storage.get(...)` patterns for `fetch('/api/...')`.

- Add an `axios` or `fetch` wrapper with the JWT token injected from `localStorage`
- Replace the event bus (`eventBus.emit()`) with Socket.IO client events — bid updates flow in automatically
- Update `auth-context.tsx` to call real `/api/auth/login` and `/api/auth/me` on mount

---

## Phase 5 — Recommender Algorithm (Days 10–11)

**Yes — absolutely include a recommender.** It's a genuine differentiator for a software engineering project and not hard to build well.

### Approach: Collaborative Filtering + Content-Based Hybrid

Since you're in a closed university ecosystem with limited users initially, use **item-based collaborative filtering** with a content fallback:

1. Build a user-action matrix: for each user, record which auctions they viewed, bid on, or bought (weighted: view=1, bid=3, won=5)
2. For a target user, find auctions they've interacted with and compute similarity scores against all other active auctions using cosine similarity on: category match, price range proximity, bid count similarity, seller trust score
3. Blend with pure content filtering for cold-start users (new users get recommendations based on trending + category diversity)

### `/api/recommendations` endpoint

- Fetches the user's bid/view history (last 30 days)
- Scores all active auctions:

```
score = categoryWeight × 0.4 + priceRangeMatch × 0.3 + engagementScore × 0.2 + trustScore × 0.1
```

- Returns top 8 ranked auctions, excluding ones the user already bid on

This maps directly to the "Recommended for you" section on your home page — a natural fit for the existing card grid.

---

## Phase 6 — Deployment (Days 12–13)

### Stack

| Service | Platform | Notes |
|---|---|---|
| Backend | Railway or Render | Free tier, auto-deploy from GitHub |
| MongoDB | MongoDB Atlas | Free tier, 512MB |
| Redis | Upstash | Free tier, serverless |
| Images | Cloudinary | Free tier, 25GB storage |
| Frontend | Vercel | Connects to GitHub, auto-builds Vite |

### Environment Variables

```
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN
REDIS_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
FRONTEND_URL
PORT
```

### Security

- **CORS** — configure Express to allow requests only from your Vercel domain in production
- **Helmet** — `helmet()` for security headers
- **Rate limiting** — `express-rate-limit` at 100 req/15min globally; stricter limits (10 req/min) on `/api/auth/login` to prevent brute force

---

## Summary Timeline

| Phase | Focus | Days |
|---|---|---|
| 1 | Foundation, models, auth | 1–2 |
| 2 | All REST routes (auctions, bids, wallet, profile, settings) | 3–5 |
| 3 | Socket.IO real-time + cron settlement | 6–7 |
| 4 | Frontend wired to real backend | 8–9 |
| 5 | Recommender algorithm | 10–11 |
| 6 | Deployment (Railway + Vercel + Atlas) | 12–13 |

> **Biggest risk:** the bid placement race condition — get Redis locking right in Phase 2 and everything else falls into place.