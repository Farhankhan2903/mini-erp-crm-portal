<div align="center">

# 🏢 Mini ERP + CRM Operations Portal

**A production-grade Full Stack ERP + CRM system** built for the Fundsroom Infotech technical assessment.

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma&logoColor=white)](https://prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

[Live Demo](#-deployment) • [API Docs](#-api-documentation) • [Postman Collection](./docs/postman/Mini-ERP-CRM.postman_collection.json) • [Architecture](./docs/ARCHITECTURE.md)

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Folder Structure](#-folder-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running Locally](#-running-locally)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Demo Credentials](#-demo-credentials)
- [Known Limitations](#-known-limitations)
- [Future Improvements](#-future-improvements)

---

## 🎯 Project Overview

The **Mini ERP + CRM Operations Portal** is a comprehensive internal business management system designed to handle sales operations, inventory management, and customer relationship management in a single unified platform.

The portal supports **4 operational roles** with differentiated access:

| Role | Primary Responsibilities |
|:---|:---|
| 👑 **ADMIN** | Full system access, user management, all CRUD operations |
| 💼 **SALES** | Customer CRM, follow-up notes, creating & confirming Sales Challans |
| 📦 **WAREHOUSE** | Product catalog, stock movements (IN/OUT/ADJUSTMENT), low-stock monitoring |
| 📊 **ACCOUNTS** | Read-only access to CRM directory, inventory valuation, sales challan audit |

---

## ✨ Features

### 🔐 Authentication & Security
- JWT Bearer token authentication with 24-hour expiry
- bcrypt password hashing (10 salt rounds)
- Role-Based Access Control (RBAC) middleware on every protected route
- Helmet.js HTTP security headers
- CORS with environment-based origin allowlisting
- Zod schema validation on all request bodies
- Global error handler with environment-aware stack trace suppression

### 👥 Customer CRM Module
- Full CRUD with paginated, sorted, multi-field search
- Filter by status (`LEAD`, `PROSPECT`, `ACTIVE`, `INACTIVE`) and type (`RETAIL`, `WHOLESALE`, `CORPORATE`)
- Customer Detail View: follow-up notes audit trail + past order history
- Timestamped notes history stored in `customer_notes` table

### 📦 Product & Inventory Module
- Product catalog with unique SKU validation (auto-uppercased)
- Warehouse location tracking
- Low-stock alert filter (`stock <= minimumStock`)
- Stock movement history per product (last 15 movements)

### 🔄 Stock Movements Audit Log
- `IN` — increases stock by quantity
- `OUT` — decreases stock (rejects if would go negative)
- `ADJUSTMENT` — sets exact stock count (for physical audit reconciliation)
- Full audit trail: user ID, timestamp, and reference reason

### 📄 Sales Challan ERP Module
- Multi-product line items per challan
- **Automatic serial numbering**: `SCH-YYYYMMDD-XXXX` (e.g. `SCH-20260810-0001`)
- **Product Snapshot Isolation**: `SalesChallanItem` stores `productName`, `sku`, `price` at time of creation — historical challans are never affected by future price changes
- **Transactional Stock Deduction**: Transitioning `DRAFT → CONFIRMED` executes atomic stock reduction inside a Prisma `$transaction`
- **Negative Stock Prevention**: Transaction aborts with HTTP `400` if stock would go below zero
- Status workflow: `DRAFT → CONFIRMED → DISPATCHED → DELIVERED` (or `CANCELLED`)

### 📊 Dashboard Analytics
- Real-time KPI cards: Total Customers, Total Products, Today's Challans, Low Stock Alert Count, Total Inventory Value (₹)
- Recent Sales Challans and Recent Customers activity streams
- Parallel query execution via `Promise.all` for sub-millisecond response times

---

## 🛠️ Technology Stack

### Backend (`backend/`)
| Technology | Version | Purpose |
|:---|:---|:---|
| Node.js | 22.x | Runtime |
| Express.js | 5.x | HTTP framework |
| TypeScript | 6.x | Type safety |
| Prisma ORM | 7.x | Database ORM + migrations |
| SQLite / PostgreSQL | — | Database (dev: SQLite, prod: PostgreSQL) |
| JWT (`jsonwebtoken`) | 9.x | Authentication tokens |
| bcrypt | 6.x | Password hashing |
| Zod | 4.x | Request validation |
| Helmet | 8.x | HTTP security headers |
| Swagger UI Express | 5.x | Interactive API documentation |
| Morgan | 1.x | HTTP request logging |

### Frontend (`frontend/`)
| Technology | Version | Purpose |
|:---|:---|:---|
| React | 19.x | UI framework |
| Vite | 8.x | Build tooling |
| TypeScript | 6.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| React Router | 7.x | Client-side routing + protected routes |
| Axios | 1.x | HTTP client with interceptors |
| React Hook Form | 7.x | Form state management |
| Zod | 4.x | Form validation schemas |
| Lucide React | 1.x | Icon library |

### Infrastructure
| Service | Provider | Purpose |
|:---|:---|:---|
| Database | Neon PostgreSQL | Serverless PostgreSQL |
| Backend API | Render | Node.js hosting |
| Frontend | Vercel | Static site CDN |
| Container | Docker + Docker Compose | Local development stack |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              React 19 Frontend              │
│         (Vite + TailwindCSS v4)             │
│   AuthContext │ Protected Routes │ Axios    │
└─────────────────────┬───────────────────────┘
                       │ HTTPS / REST
                       ▼
┌─────────────────────────────────────────────┐
│          Express 5 + TypeScript API         │
│   Helmet │ CORS │ Morgan │ JWT Auth │ Zod   │
│ ─────────────────────────────────────────── │
│  Routes → Controllers → Services            │
│         ↓ Prisma ORM ↓                      │
└─────────────────────┬───────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│       SQLite (dev) / PostgreSQL (prod)      │
│   users │ customers │ products              │
│   stock_movements │ sales_challans          │
│   sales_challan_items │ customer_notes      │
└─────────────────────────────────────────────┘
```

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed Mermaid diagrams.

---

## 📁 Folder Structure

```
mini-erp-crm-portal/
├── backend/                    # Express + TypeScript API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema + relations
│   │   ├── seed.ts             # Demo data seeder
│   │   └── migrations/         # SQL migration history
│   └── src/
│       ├── app.ts              # Express app setup (CORS, Helmet, routes)
│       ├── index.ts            # Server entry point
│       ├── config/             # Environment validation (Zod)
│       ├── controllers/        # Request handlers (thin layer)
│       ├── middlewares/        # Auth, error handler, validate
│       ├── routes/             # Route definitions + Swagger JSDoc
│       ├── services/           # Business logic layer
│       ├── types/              # Enums, TypeScript types
│       ├── utils/              # Response helpers
│       └── validators/         # Zod schemas per module
│
├── frontend/                   # React 19 + Vite application
│   └── src/
│       ├── components/common/  # Button, Card, Input, Modal, Spinner...
│       ├── constants/          # App-wide constants
│       ├── context/            # AuthContext, ToastContext
│       ├── hooks/              # Custom React hooks
│       ├── layouts/            # DashboardLayout, ProtectedRoute
│       ├── pages/              # Route-level page components
│       ├── services/           # Axios API service layer
│       ├── types/              # TypeScript interfaces
│       └── utils/              # formatINR, etc.
│
├── docs/
│   ├── postman/                # Postman collection (all endpoints)
│   ├── screenshots/            # App screenshots
│   ├── ARCHITECTURE.md         # System architecture + Mermaid diagrams
│   ├── DATABASE.md             # ER diagram + table descriptions
│   ├── DEPLOYMENT.md           # Step-by-step deployment guide
│   ├── API_DOCUMENTATION.md    # Full API reference
│   ├── PROJECT_STRUCTURE.md    # Annotated folder tree
│   ├── KNOWN_LIMITATIONS.md    # Honest limitations assessment
│   ├── FUTURE_IMPROVEMENTS.md  # Roadmap items
│   ├── VIDEO_SCRIPT.md         # 5–8 minute demo video script
│   └── VIDEO_CHECKLIST.md      # Recording checklist
│
├── docker-compose.yml          # Multi-container local stack
├── .github/workflows/ci.yml    # GitHub Actions CI pipeline
├── LICENSE                     # MIT License
└── README.md                   # This file
```

---

### 🧪 Automated Testing & Quality Assurance
- **Backend**: Jest + Supertest integration test suite covering Auth, Customers, Products, Stock Movements, Sales Challans, and Dashboard metrics.
- **Frontend**: Vitest + React Testing Library unit testing setup.
- **Unified Workspace Command**: `npm test` runs full backend and frontend test suites.
- **ESLint & Code Quality**: 0 errors, 0 warnings across full monorepo (`npm run lint`).

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Git

### Running Full Test Suite & Linting
```bash
npm test         # Runs both Backend (Jest) and Frontend (Vitest) test suites
npm run lint     # Verifies 0 ESLint errors and 0 warnings
npm run build    # Compiles both Backend (tsc) and Frontend (vite build)
```

### One-Step Startup (Recommended)
```bash
# Clone the repository
git clone https://github.com/Farhankhan2903/mini-erp-crm-portal.git
cd mini-erp-crm-portal

# Terminal 1 — Backend API (Port 5001)
npm run dev:backend

# Terminal 2 — Frontend App (Port 5173)
npm run dev:frontend
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
# Server Port
PORT=5001

# Database (SQLite for dev, PostgreSQL for prod)
DATABASE_URL="file:./dev.db"
# DATABASE_URL="postgresql://user:pass@host:5432/mini_erp_crm?schema=public"

# JWT Secret — use a strong random string in production
JWT_SECRET="replace-with-a-strong-secret-in-production"

# Environment
NODE_ENV="development"

# Production: comma-separated allowed frontend origins
# ALLOWED_ORIGINS="https://your-app.vercel.app"
```

### Frontend (`frontend/.env`)
```env
# Backend API base URL
VITE_API_URL="http://localhost:5001/api/v1"
```

---

## 🗄️ Database Setup

```bash
cd backend

# 1. Generate Prisma client from schema
npx prisma generate

# 2. Push schema to database (dev: creates SQLite automatically)
npx prisma db push

# 3. Seed demo accounts and sample data
npx tsx prisma/seed.ts

# Optional: Open Prisma Studio (visual DB explorer)
npx prisma studio
```

For PostgreSQL migration (production):
```bash
npx prisma migrate deploy
```

---

## 🚀 Running Locally

### Method 1: NPM Workspace Scripts (Recommended)
```bash
# From repo root
npm run dev:backend    # Starts Express on :5001
npm run dev:frontend   # Starts Vite on :5173
```

### Method 2: Docker Compose
```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:5001
# Swagger:  http://localhost:5001/docs
```

### Access Points
| Service | URL |
|:---|:---|
| 💻 Frontend App | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:5001/api/v1 |
| 📖 Swagger Docs | http://localhost:5001/docs |
| 🩺 Health Check | http://localhost:5001/health |

---

## 🌐 Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for the complete step-by-step guide.

### Quick Overview
1. **Database** → [Neon.tech](https://neon.tech) (serverless PostgreSQL)
2. **Backend** → [Render](https://render.com) (Node.js Web Service, root dir: `backend`)
3. **Frontend** → [Vercel](https://vercel.com) (Vite preset, root dir: `frontend`)

---

## 📖 API Documentation

- **Interactive Swagger UI**: http://localhost:5001/docs
- **Full API Reference**: [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)
- **Postman Collection**: [docs/postman/Mini-ERP-CRM.postman_collection.json](./docs/postman/Mini-ERP-CRM.postman_collection.json)

Import the Postman collection, run **Login — Admin** first, and all subsequent requests will automatically use the saved JWT token.

---

## 🔑 Demo Credentials

All demo accounts share the password `Admin@123`.

| Role | Email | Password | Access Level |
|:---|:---|:---|:---|
| 👑 **ADMIN** | `admin@minierp.com` | `Admin@123` | Full — all modules, user registration |
| 💼 **SALES** | `sales@minierp.com` | `Admin@123` | Customers, Sales Challans |
| 📦 **WAREHOUSE** | `warehouse@minierp.com` | `Admin@123` | Products, Stock Movements |
| 📊 **ACCOUNTS** | `accounts@minierp.com` | `Admin@123` | Read-only across all modules |

---

## ⚠️ Known Limitations

See [docs/KNOWN_LIMITATIONS.md](./docs/KNOWN_LIMITATIONS.md) for the full list.

- No real-time notifications (polling-based dashboard)
- No file attachments for challans or customer documents
- No email/SMS integration for follow-up reminders
- No multi-currency support (INR only)
- No challan PDF export

---

## 🔮 Future Improvements

See [docs/FUTURE_IMPROVEMENTS.md](./docs/FUTURE_IMPROVEMENTS.md) for the complete roadmap.

- PDF/Excel export for Sales Challans and inventory reports
- Real-time WebSocket notifications for stock alerts
- Email integration for automated follow-up reminders
- Purchase Orders module
- Analytics dashboard with Chart.js/Recharts visualizations
- Automated test suite (Jest + Supertest for API, Vitest for UI)

---

## 🤖 CI/CD

The repository includes a **GitHub Actions workflow** at [`.github/workflows/ci.yml`](.github/workflows/ci.yml) that runs on every push and pull request:

- TypeScript compilation check (`tsc --noEmit`)
- Backend build verification (`npm run build`)
- Frontend build verification (`vite build`)

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built with ❤️ by [Farhan Khan](https://github.com/Farhankhan2903) for Fundsroom Infotech**

</div>
