# 🏢 Mini ERP + CRM Operations Portal

> Full Stack Developer Operations Portal Case Study built with **Node.js**, **Express.js**, **TypeScript**, **Prisma ORM**, **React 19**, **Vite**, and **Tailwind CSS v4**.

---

## ⚡ EXACT COMMANDS TO RUN THIS PROJECT

### 1. One-Step Startup (From Project Root)
Open two terminal tabs in the root directory:

```bash
# Terminal 1: Start Backend API Server (Port 5001)
npm run dev:backend

# Terminal 2: Start Frontend Web Application (Port 5173)
npm run dev:frontend
```

---

### 2. Step-by-Step Manual Setup (From Scratch)

#### Step 1: Install Dependencies
```bash
# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

#### Step 2: Initialize & Seed Database
```bash
cd ../backend

# Generate Prisma Client & Sync Database
npx prisma generate
npx prisma db push

# Seed Demo Accounts & Sample Data
npx tsx prisma/seed.ts
```

#### Step 3: Launch Servers
```bash
# Terminal 1 - Backend Server (Port 5001):
cd backend
npm run dev

# Terminal 2 - Frontend App (Port 5173):
cd frontend
npm run dev
```

---

### 🌐 System URLs & Access Points

| Service | Access URL | Description |
| :--- | :--- | :--- |
| 💻 **Frontend Web App** | [`http://localhost:5173`](http://localhost:5173) | React 19 + Tailwind CSS ERP/CRM Portal |
| ⚙️ **Backend API Server** | [`http://localhost:5001/api/v1`](http://localhost:5001/api/v1) | Express + TypeScript REST API Server |
| 📖 **Interactive Swagger Docs** | [`http://localhost:5001/docs`](http://localhost:5001/docs) | Interactive OpenAPI 3.0 API Documentation |
| 🩺 **Health Check** | [`http://localhost:5001/health`](http://localhost:5001/health) | API Server status endpoint |

---

## 🔑 Demo Login Credentials

The database contains pre-seeded demo accounts for all 4 operational roles:

| Role | Email Address | Password | Permissions & Access Summary |
| :--- | :--- | :--- | :--- |
| 👑 **ADMIN** | `admin@minierp.com` | `Admin@123` | Full access: User management, Customer CRUD, Product CRUD, Stock adjustments, Challan generation |
| 💼 **SALES** | `sales@minierp.com` | `Admin@123` | Customer CRM management, Follow-up notes, Creating and confirming Sales Challans |
| 📦 **WAREHOUSE** | `warehouse@minierp.com` | `Admin@123` | Product catalog maintenance, Low stock alerts, Logging stock movements (`IN`, `OUT`, `ADJUSTMENT`), Status updates |
| 📊 **ACCOUNTS** | `accounts@minierp.com` | `Admin@123` | Read-only inspection across CRM directory, Inventory valuation, Sales Challans, and Audit logs |

---

## 🛠️ Technology Stack

### Backend Services (`backend/`)
- **Runtime**: Node.js & Express.js with TypeScript
- **Database & ORM**: Prisma ORM 7 with SQLite / PostgreSQL support
- **Security & Auth**: JWT (JSON Web Tokens), bcrypt password hashing, Helmet, CORS
- **Validation**: Zod schema validation
- **API Documentation**: Swagger UI Express (`/docs` and `/api-docs`) & Postman Collection v2.1

### Frontend Application (`frontend/`)
- **Framework**: React 19 + Vite + TypeScript
- **Styling**: Vanilla Tailwind CSS v4 (No 3rd-party UI component libraries)
- **Routing**: React Router v7 with Protected Route Guards
- **State Management**: React Context (`AuthContext` & `ToastContext`)
- **Networking**: Axios client with Bearer token interceptors & 401 Unauthorized handling

---

## 📜 Key Modules & Business Logic

1. **Authentication & RBAC**:
   - Secure login & profile endpoints (`POST /auth/login`, `GET /auth/me`).
   - Role-based authorization middleware restricting actions by role (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).

2. **Customer CRM**:
   - Customer directory with multi-field search (`name`, `email`, `mobile`, `businessName`, `gst`).
   - Status filters (`LEAD`, `PROSPECT`, `ACTIVE`, `INACTIVE`) and Customer Type filters (`RETAIL`, `WHOLESALE`, `CORPORATE`).
   - Customer Detail View with historical follow-up notes audit trail and past order history.

3. **Products & Inventory**:
   - Product catalog management with unique SKU validation and warehouse location tracking.
   - Low Stock Alert query filter (`stock <= minimumStock`).

4. **Stock Movements Audit Log**:
   - Track inventory adjustments (`IN`, `OUT`, `ADJUSTMENT`) with audit logs recording user ID, timestamp, and reference reason.

5. **Sales Challan ERP Module**:
   - Customer order entry with multi-product line items.
   - Automatic serial numbering formatted as `SCH-YYYYMMDD-XXXX` (e.g. `SCH-20260810-0001`).
   - Product Snapshot Isolation: Historical `SalesChallanItem` snapshots (`productName`, `sku`, `price`, `quantity`) protect past invoices from future price edits.
   - Transactional Stock Reduction: Transitioning status to `CONFIRMED` executes stock deduction inside a Prisma `$transaction`.
   - **Negative Stock Prevention**: Verifies `product.stock >= item.quantity`. If stock is insufficient, aborts transaction and returns HTTP `400 Bad Request`.

6. **Dashboard Analytics**:
   - Real-time KPI Cards (Total Customers, Total Products, Today's Challans, Low Stock Alert Count, Total Inventory Value) and Recent Activity Streams.
   - Parallel database execution using `Promise.all` for sub-millisecond response times.

---

## 📖 API Documentation & Postman

- **Interactive Swagger OpenAPI**: `http://localhost:5001/docs` (or `/api-docs`)
- **Postman Collection**: Pre-configured collection file located at [`backend/postman_collection.json`](file:///Users/farhankhan/Documents/Fundsroom%20Infotech/backend/postman_collection.json)

---

## 🐳 Docker & Docker Compose Quickstart

Run the complete multi-container stack with a single command:

```bash
docker-compose up --build
```

- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5001`
- **Swagger Docs**: `http://localhost:5001/docs`

---

## 🚀 Production Deployment Guide

### 1. Database Deployment (Neon PostgreSQL)
1. Create a serverless PostgreSQL instance on [Neon.tech](https://neon.tech).
2. Copy connection string and update `DATABASE_URL` in backend env.
3. Run migrations and seed data:
   ```bash
   npx prisma migrate deploy
   npx tsx prisma/seed.ts
   ```

### 2. Backend Deployment (Render)
1. Create a new **Web Service** on [Render](https://render.com) connected to your repository.
2. Select Root Directory: `backend`.
3. Set Build Command: `npm install && npx prisma generate && npm run build`
4. Set Start Command: `npm start`
5. Configure Environment Variables (`PORT: 5001`, `NODE_ENV: production`, `DATABASE_URL`, `JWT_SECRET`).

### 3. Frontend Deployment (Vercel)
1. Create a new project on [Vercel](https://vercel.com) importing your repository.
2. Select Root Directory: `frontend`.
3. Framework Preset: **Vite**.
4. Configure Environment Variable: `VITE_API_URL: https://your-backend-render-service.onrender.com/api/v1`.
5. Click **Deploy**.

---

## ⚙️ Automated GitHub Actions CI Pipeline

The repository includes a GitHub Actions workflow at `.github/workflows/ci.yml` that automatically runs build verification and TypeScript typechecks (`npx tsc --noEmit`) on every push and pull request.
