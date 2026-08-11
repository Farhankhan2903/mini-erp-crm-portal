# 🚀 Deployment Guide — Mini ERP + CRM Operations Portal

This guide covers deploying the complete stack to **Neon PostgreSQL** + **Render** (backend) + **Vercel** (frontend).

---

## Overview

| Component | Platform | URL Format |
|:---|:---|:---|
| Database | Neon.tech (Serverless PostgreSQL) | `postgresql://...@*.neon.tech/...` |
| Backend API | Render (Node.js Web Service) | `https://mini-erp-crm-api.onrender.com` |
| Frontend SPA | Vercel (Static CDN) | `https://mini-erp-crm.vercel.app` |

---

## Step 1: Database — Neon PostgreSQL

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Click **"New Project"** and name it `mini-erp-crm`
3. Select your preferred cloud region (choose same region as Render for low latency)
4. Once created, copy the **Connection String** from the dashboard

   The string looks like:
   ```
   postgresql://neondb_owner:abc123@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

5. Run migrations against the Neon database:
   ```bash
   cd backend
   DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
   ```

6. Seed demo data:
   ```bash
   DATABASE_URL="your-neon-connection-string" npx tsx prisma/seed.ts
   ```

---

## Step 2: Backend — Render

1. Go to [render.com](https://render.com) and create a free account
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `Farhankhan2903/mini-erp-crm-portal`
4. Configure the service:

   | Setting | Value |
   |:---|:---|
   | **Root Directory** | `backend` |
   | **Environment** | `Node` |
   | **Build Command** | `npm install && npx prisma generate && npm run build` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free (or Starter for production) |

5. Add **Environment Variables**:

   | Key | Value |
   |:---|:---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5001` |
   | `DATABASE_URL` | Your Neon connection string |
   | `JWT_SECRET` | A strong random secret (32+ chars) |
   | `ALLOWED_ORIGINS` | `https://your-app.vercel.app` |

6. Click **"Create Web Service"** — Render will auto-deploy on every git push

> **Note:** Free tier Render services spin down after 15 minutes of inactivity. The first request after a spin-down may take 30–60 seconds. Upgrade to a paid plan for production use.

---

## Step 3: Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) and create a free account
2. Click **"New Project"** → Import `Farhankhan2903/mini-erp-crm-portal`
3. Configure the project:

   | Setting | Value |
   |:---|:---|
   | **Framework Preset** | `Vite` |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

4. Add **Environment Variable**:

   | Key | Value |
   |:---|:---|
   | `VITE_API_URL` | `https://mini-erp-crm-api.onrender.com/api/v1` |

5. Click **"Deploy"**

> Vercel automatically enables HTTPS, global CDN, and deploys on every git push.

---

## Post-Deployment Verification

After both services are live, verify:

```bash
# 1. Backend health check
curl https://mini-erp-crm-api.onrender.com/health

# Expected response:
# {"status":"ok","timestamp":"...","service":"Mini ERP + CRM API Server","version":"1.0.0"}

# 2. API v1 info
curl https://mini-erp-crm-api.onrender.com/api/v1

# 3. Swagger docs
# Open: https://mini-erp-crm-api.onrender.com/docs

# 4. Frontend
# Open: https://mini-erp-crm.vercel.app
# Login with: admin@minierp.com / Admin@123
```

---

## Environment Variables Reference

### Backend (complete)

```env
# Required
PORT=5001
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"
JWT_SECRET="use-a-strong-random-64-char-string-here"
NODE_ENV="production"

# Recommended for production
ALLOWED_ORIGINS="https://your-frontend.vercel.app"
```

### Frontend (complete)

```env
VITE_API_URL="https://your-backend.onrender.com/api/v1"
```

---

## Docker Compose (Local Full Stack)

For running the full stack locally with Docker:

```bash
# From repo root
docker-compose up --build

# Services:
# PostgreSQL:  localhost:5432
# Backend API: localhost:5001
# Frontend:    localhost:3000
# Swagger:     localhost:5001/docs
```

---

## CI/CD — GitHub Actions

The repository includes automatic CI at `.github/workflows/ci.yml`:

- Triggers on every push to `main` and all pull requests
- Runs TypeScript typechecks on backend and frontend
- Runs production build verification

Render and Vercel both support **auto-deploy on git push** — no manual deployment steps needed after initial setup.

---

## Generating a Secure JWT Secret

```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: OpenSSL
openssl rand -hex 64
```

---

## Troubleshooting

| Problem | Solution |
|:---|:---|
| `DATABASE_URL is required` error on Render | Verify env var is set in Render dashboard |
| CORS errors in browser | Add your Vercel URL to `ALLOWED_ORIGINS` in Render env vars |
| Render service sleeping | Upgrade from Free to Starter tier, or use UptimeRobot ping |
| Prisma generate fails | Ensure `npx prisma generate` is in the build command |
| Vite build fails | Check `VITE_API_URL` is set in Vercel environment variables |
