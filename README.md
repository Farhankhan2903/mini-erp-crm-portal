<div align="center">

# 🏢 Fundsroom Infotech — Mini ERP + CRM Operations Portal
### *Indian B2B Wholesale & Distribution Management System*

[![Node.js](https://img.shields.io/badge/Node.js-20.x%20%7C%2022.x-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white)](https://prisma.io)
[![Jest](https://img.shields.io/badge/Jest-16%2F16%20Passed-C21325?logo=jest&logoColor=white)](https://jestjs.io)
[![Vitest](https://img.shields.io/badge/Vitest-4%2F4%20Passed-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

[🌐 Live Frontend App](https://mini-erp-crm-portal.vercel.app) • [⚡ Live Backend API](https://mini-erp-crm-api.onrender.com/api/v1) • [📖 Swagger API Docs](https://mini-erp-crm-api.onrender.com/docs) • [🐙 GitHub Repo](https://github.com/Farhankhan2903/mini-erp-crm-portal.git)

</div>

---

## 📋 Table of Contents

- [🎯 Project Overview & Business Purpose](#-project-overview--business-purpose)
- [🇮🇳 Indian Market B2B Localization](#-indian-market-b2b-localization)
- [✨ Core Features & Capabilities](#-core-features--capabilities)
- [🛠️ Technology Stack](#-technology-stack)
- [🏗️ System Architecture & Workflow Diagrams](#️-system-architecture--workflow-diagrams)
- [📁 Monorepo Folder Structure](#-monorepo-folder-structure)
- [🛡️ Role-Based Access Control (RBAC) Matrix](#️-role-based-access-control-rbac-matrix)
- [⚡ Quick Start & Local Development](#-quick-start--local-development)
- [🔐 Environment Variables Configuration](#-environment-variables-configuration)
- [🗄️ Database Setup & Seeding](#️-database-setup--seeding)
- [🧪 Automated Test Suite & Quality Assurance](#-automated-test-suite--quality-assurance)
- [🌐 Production Deployment](#-production-deployment)
- [📖 API Reference & Interactive Swagger Docs](#-api-reference--interactive-swagger-docs)
- [📮 Postman Collection](#-postman-collection)
- [🔑 Seeded Demo Credentials](#-seeded-demo-credentials)
- [⚠️ Known Limitations & Future Roadmap](#️-known-limitations--future-roadmap)
- [📄 License & Author](#-license--author)

---

## 🎯 Project Overview & Business Purpose

The **Mini ERP + CRM Operations Portal** is an enterprise-grade, production-ready full-stack business management application built for **Fundsroom Infotech**. 

Tailored specifically for the **Indian B2B Wholesale & Industrial Distribution sector**, the platform unifies customer relationship management (CRM), product cataloging, multi-warehouse stock management, and sales order/challan generation into a single intuitive Web SPA.

### 🌟 Value Proposition
- **Snapshot Isolation**: Historical Sales Challan line items store immutable prices, SKUs, and product names at creation time—preventing historical invoice corruption when catalog prices change.
- **Atomic Stock Deduction**: Order transitions to `DISPATCHED` execute transactional inventory deduction inside a Prisma `$transaction`, with automated rollback if stock falls below zero.
- **Zero-Trust Security**: Every route is protected by JWT authentication, strict Zod input validation, Helmet HTTP headers, and Role-Based Access Control (RBAC).
- **Indian Compliance Ready**: Built-in support for 15-digit state GSTIN validation, 10-digit Indian mobile validation, Indian numbering system currency formatting (`₹ INR`), and `DD/MM/YYYY` date representation.

---

## 🇮🇳 Indian Market B2B Localization

The portal has been localized for Indian B2B operations (inspired by Tally, Vyapar, and Zoho Books):

| Dimension | Standard Applied | Example / Details |
|:---|:---|:---|
| 💰 **Currency** | `₹ INR` (Indian Numbering System) | `formatCurrencyINR()` → `₹12,500.00`, `₹1,49,999.50`, `₹64,500.00` |
| 📅 **Date Format** | `DD/MM/YYYY` Standard | `formatDateIN()` → `11/08/2026` across all tables, logs, and notes |
| 📱 **Mobile Validation** | 10-Digit Indian Regex | `^(\+91[\s-]?)?[6-9]\d{9}$` (Formatted as `+91 98250 12345`) |
| 🏢 **GSTIN Validation** | 15-Char Alphanumeric State Regex | `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$` (`24AAACP1234A1Z5`) |
| 🔍 **Multi-Field Search** | City / State / GSTIN Search | Query customers by GSTIN, Business Name, Contact Name, City, or PIN |
| 🧾 **Tax Breakdown** | GST Calculation | Automatic calculation of Subtotal, CGST (9%), SGST (9%), and Grand Total (`₹`) |
| 🏭 **Warehouses** | Indian Distribution Hubs | *Ahmedabad Central Depot, Surat Logistics Hub, Mumbai Main Godown, Delhi Center, Vadodara Bay* |
| 📦 **Product Catalog** | Industrial Hardware & Supplies | *Polycab Flexible Cables, Havells Fans, Asian Paints, Tata Tiscon Steel, Astral PVC Pipes, Bosch Tools* |

---

## ✨ Core Features & Capabilities

### 🔐 Authentication & Role Security
- **JWT Authentication**: Signed JWT Bearer tokens with 24-hour expiration.
- **Password Security**: Passwords hashed using `bcrypt` (10 salt rounds). Hash values are stripped from all JSON responses.
- **RBAC Middleware**: Enforces granular permissions across `ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS`.
- **Security Headers**: Configured with `helmet` and environment-restricted `cors`.

### 👥 Customer CRM Module
- **Full Lifecycle CRM**: Manage `LEAD` → `PROSPECT` → `ACTIVE` → `INACTIVE` customer pipelines.
- **Categorization**: Tag accounts as `RETAIL`, `WHOLESALE`, or `CORPORATE`.
- **Follow-up Audit Log**: Log follow-up notes with scheduled follow-up dates; historical notes are persisted in `customer_notes`.
- **Detailed Account View**: Integrated view showing client profile, GSTIN badge, follow-up timeline, and order history.

### 📦 Product & Multi-Warehouse Inventory
- **Catalog Management**: CRUD operations for catalog products with unique SKU enforcement (auto-uppercased).
- **Low Stock Alerts**: Real-time filtering for items at or below `minimumStock` threshold.
- **Warehouse Mapping**: Track stock across multiple Indian warehouses and storage bays.

### 📜 Stock Movement Audit Trail
- **Movement Types**:
  - `IN`: Supplier arrival / restock (+ quantity)
  - `OUT`: Damage / return (- quantity with negative stock guards)
  - `ADJUSTMENT`: Physical count audit reconciliation
- **Immutable Log**: Logs user ID, timestamp, movement type, and reference reason.

### 📄 Sales Challan ERP Module
- **Serial Numbering**: Automatic formatted numbering `SCH-YYYYMMDD-XXXX` (e.g. `SCH-20260810-0001`).
- **Product Line Snapshots**: Captures product name, SKU, and unit price at time of order creation.
- **Transactional Stock Deduction**: Transitioning status to `DISPATCHED` triggers atomic stock reduction in a Prisma `$transaction`.
- **Workflow State Machine**: `DRAFT → CONFIRMED → DISPATCHED → DELIVERED` (or `CANCELLED`).

### 📊 Operations Dashboard
- **KPI Metrics**: Real-time cards for Total Customers, Total Products, Today's Challans, Low Stock Alert Count, and Total Inventory Valuation (`₹ INR`).
- **Activity Streams**: Real-time feeds of recent Sales Challans and newly onboarded CRM contacts.
- **Performance**: High-speed parallel database queries via `Promise.all`.

---

## 🛠️ Technology Stack

### Backend Services (`backend/`)
- **Runtime**: Node.js `20.x` / `22.x`
- **Framework**: Express.js `5.x` (TypeScript)
- **Database ORM**: Prisma ORM `6.x`
- **Databases**: SQLite (`dev.db` for local dev/testing) & PostgreSQL (Neon.tech for production)
- **Validation**: Zod `3.x` / `4.x` schemas
- **Authentication**: `jsonwebtoken` (JWT) & `bcrypt`
- **Security**: `helmet`, `cors`, `express-rate-limit`, `compression`
- **Documentation**: `swagger-ui-express` & `swagger-jsdoc`

### Frontend Application (`frontend/`)
- **UI Framework**: React `19.x`
- **Build Tool**: Vite `8.x`
- **Language**: TypeScript `6.x`
- **Styling**: Tailwind CSS `4.x` & Lucide Icons
- **Routing**: React Router `7.x` (with `React.lazy()` code-splitting & protected route guards)
- **HTTP Client**: Axios `1.x` (with global auth & error interceptors)
- **State & Forms**: React Hook Form & Zod
- **Unit Testing**: Vitest `4.x` + `@testing-library/react` + `happy-dom`

---

## 🏗️ System Architecture & Workflow Diagrams

### High-Level Component Architecture
```
┌────────────────────────────────────────────────────────────────────────┐
│                   React 19 SPA (Vite + TailwindCSS v4)                 │
│   AuthContext │ ToastContext │ ProtectedRoute │ Axios Interceptors     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / JSON REST
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Express 5 + TypeScript API Server                  │
│   Helmet │ RateLimiters │ CORS │ Compression │ Morgan │ ErrorHandler   │
│ ────────────────────────────────────────────────────────────────────── │
│  Routes (/api/v1) → Controllers → Zod Validators → Services          │
│                                   ↓                                    │
│                             Prisma ORM                                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQL (Prisma Adapter)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             SQLite (Development) / PostgreSQL (Production)             │
│   users │ customers │ products │ stock_movements │ sales_challans     │
└────────────────────────────────────────────────────────────────────────┘
```

### Transactional Stock Reduction Flow (`DRAFT → DISPATCHED`)
```
User Requests Status Change (DISPATCHED)
               │
               ▼
   Challan Service Received Request
               │
               ▼
   Begin Prisma $transaction
      ├── Fetch Challan Items Snapshot
      ├── Loop through each Item:
      │      ├── Check Product Current Stock
      │      └── Stock < Required Quantity? ──► YES ──► ABORT & ROLLBACK (400 Bad Request)
      │                                                     │
      │                                                     NO
      │                                                     │
      ├── Deduct Quantity from Product Stock                │
      ├── Create Stock Movement Log (OUT / Sales Challan)   │
      └── Update Sales Challan Status to DISPATCHED         │
               │                                            │
               ▼                                            ▼
   Commit Transaction ──────────────────────────────► Stock Updated!
```

---

## 📁 Monorepo Folder Structure

```
mini-erp-crm-portal/
├── backend/                    # Express + TypeScript REST API Server
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma database models & relationships
│   │   ├── seed.ts             # Indian Wholesalers, Products & Warehouse Seeder
│   │   └── dev.db              # SQLite development database file
│   └── src/
│       ├── app.ts              # Express application setup & middleware stack
│       ├── index.ts            # Entry point HTTP server launcher
│       ├── config/             # Zod environment variable parser & Swagger spec
│       ├── controllers/        # Request/response controllers
│       ├── middlewares/        # Auth JWT verification, RBAC guard, Error Handler
│       ├── repositories/       # Data access layer interfacing Prisma
│       ├── routes/             # REST endpoints with Swagger OpenAPI annotations
│       ├── services/           # Core business logic (stock deduction transaction)
│       ├── types/              # Enums, interfaces, role definitions
│       ├── utils/              # Response formatters & async handlers
│       ├── validators/         # Zod schemas (GSTIN, Indian phone, SKU regex)
│       └── __tests__/          # Jest integration test suite (16/16 tests)
│
├── frontend/                   # React 19 + Vite Single Page Application
│   ├── vitest.config.ts        # Vitest test configuration (happy-dom)
│   ├── vite.config.ts          # Vite build & alias configuration
│   └── src/
│       ├── components/common/  # Reusable UI components (Button, Modal, Badge, Card...)
│       ├── context/            # AuthContext & ToastContext providers
│       ├── layouts/            # DashboardLayout & ProtectedRoute guards
│       ├── pages/              # Route views (Dashboard, Customers, Products, Inventory...)
│       ├── services/           # Axios API services (customer, product, challan)
│       ├── types/              # TypeScript interfaces & types
│       ├── utils/              # Indian formatters (formatCurrencyINR, formatDateIN...)
│       └── __tests__/          # Vitest UI component test suite (4/4 tests)
│
├── docs/                       # Comprehensive System Documentation
│   ├── postman/                # Pre-configured Postman API Collection
│   ├── screenshots/            # Vector SVG previews
│   ├── ARCHITECTURE.md         # Full architecture specification & diagrams
│   ├── DATABASE.md             # ER diagrams & database schema documentation
│   ├── DEPLOYMENT.md           # Step-by-step production deployment guide
│   ├── API_DOCUMENTATION.md    # Detailed REST API endpoints reference
│   └── PROJECT_STRUCTURE.md    # Codebase structural breakdown
│
├── .github/workflows/ci.yml    # GitHub Actions automated CI pipeline
├── docker-compose.yml          # Containerized local development stack
├── package.json                # Monorepo root scripts & aliases
├── vercel.json                 # Vercel deployment rewrite rules
├── LICENSE                     # MIT License
└── README.md                   # System documentation
```

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Endpoint Route | HTTP Method | Allowed Roles | Description |
|:---|:---:|:---|:---|
| `/api/v1/auth/login` | `POST` | Public | Authenticate user & receive JWT token |
| `/api/v1/auth/me` | `GET` | All Roles | Fetch current user profile |
| `/api/v1/dashboard/metrics` | `GET` | All Roles | View operations dashboard metrics |
| `/api/v1/customers` | `GET` | All Roles | List/Search CRM customer directory |
| `/api/v1/customers` | `POST` | `ADMIN`, `SALES` | Create new customer account |
| `/api/v1/customers/:id` | `GET`, `PUT` | `ADMIN`, `SALES` | View detail or update customer info |
| `/api/v1/customers/:id` | `DELETE` | `ADMIN` | Permanently remove customer record |
| `/api/v1/customers/:id/notes` | `POST` | `ADMIN`, `SALES` | Log follow-up note & update follow-up date |
| `/api/v1/products` | `GET` | All Roles | View catalog products & inventory |
| `/api/v1/products` | `POST`, `PUT` | `ADMIN`, `WAREHOUSE` | Add or edit product details |
| `/api/v1/products/:id` | `DELETE` | `ADMIN` | Delete catalog product |
| `/api/v1/stock-movements` | `GET` | All Roles | View stock movement audit log |
| `/api/v1/stock-movements` | `POST` | `ADMIN`, `WAREHOUSE` | Record manual stock IN/OUT/ADJUSTMENT |
| `/api/v1/sales-challans` | `GET`, `GET :id` | All Roles | List and view sales orders/challans |
| `/api/v1/sales-challans` | `POST` | `ADMIN`, `SALES` | Generate new Sales Challan |
| `/api/v1/sales-challans/:id/status` | `PATCH` | `ADMIN`, `SALES`, `WAREHOUSE` | Update workflow status (triggers stock deduction) |

---

## ⚡ Quick Start & Local Development

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher

### 1-Step Parallel Dev Execution (Root Directory)
```bash
# 1. Clone repository
git clone https://github.com/Farhankhan2903/mini-erp-crm-portal.git
cd mini-erp-crm-portal

# 2. Terminal 1 — Start Backend Server (Port 5001)
npm run dev:backend

# 3. Terminal 2 — Start Frontend Application (Port 5173)
npm run dev:frontend
```

### 2-Terminal Execution (Component Directories)
```bash
# Terminal 1 — Backend
cd backend
npm install
npx prisma generate
npx tsx prisma/seed.ts
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables Configuration

### Backend (`backend/.env`)
```env
PORT=5001
NODE_ENV=development
DATABASE_URL="file:./dev.db"
# Production Database URL:
# DATABASE_URL="postgresql://username:password@ep-host.neon.tech/neondb?sslmode=require"
JWT_SECRET="super-secret-jwt-key-minierp-2026"
ALLOWED_ORIGINS="http://localhost:5173,https://mini-erp-crm-portal.vercel.app"
```

### Frontend (`frontend/.env`)
```env
# Backend API Base URL
VITE_API_URL="http://localhost:5001/api/v1"
```

---

## 🗄️ Database Setup & Seeding

```bash
cd backend

# 1. Generate Prisma Client
npx prisma generate

# 2. Push Schema to SQLite (Creates dev.db automatically)
npx prisma db push --accept-data-loss

# 3. Seed Database with Indian Wholesalers, Products & Warehouses
npx tsx prisma/seed.ts

# Optional: Open Visual Database Explorer
npx prisma studio
```

---

## 🧪 Automated Test Suite & Quality Assurance

The codebase includes a comprehensive test suite across backend and frontend layers:

```bash
# Run All Unit & Integration Tests Across Monorepo
npm test

# Run ESLint Linting Check (0 Errors, 0 Warnings Enforced)
npm run lint

# Run Full TypeScript & Vite Production Build Check
npm run build
```

### Test Suite Summary
- **Backend (Jest + Supertest)**: `16/16 Passed` (Integration tests for Auth, Customer CRM, Product Inventory, Stock Movement Audit, Sales Challan Stock Deduction Transaction, Dashboard Metrics).
- **Frontend (Vitest + Happy-DOM)**: `4/4 Passed` (React UI Button, Badge, rendering, state handlers, and loading states).
- **ESLint Compliance**: `0 Errors`, `0 Warnings` across all TypeScript and React files.

---

## 🌐 Production Deployment

| Tier | Host Provider | Build / Start Command | Public Endpoint URL |
|:---|:---|:---|:---|
| **Frontend SPA** | Vercel | `npm run build` | [https://mini-erp-crm-portal.vercel.app](https://mini-erp-crm-portal.vercel.app) |
| **Backend REST API** | Render | `npm run build && npm start` | [https://mini-erp-crm-api.onrender.com/api/v1](https://mini-erp-crm-api.onrender.com/api/v1) |
| **Interactive Docs** | Render | Serves Swagger UI | [https://mini-erp-crm-api.onrender.com/docs](https://mini-erp-crm-api.onrender.com/docs) |
| **Database** | Neon PostgreSQL | Serverless PostgreSQL | `postgresql://...@*.neon.tech/neondb` |

---

## 📖 API Reference & Interactive Swagger Docs

Interactive OpenAPI 3.0 documentation is available natively on the API server:
- **Live Online Docs**: [https://mini-erp-crm-api.onrender.com/docs](https://mini-erp-crm-api.onrender.com/docs)
- **Local Swagger UI**: [http://localhost:5001/docs](http://localhost:5001/docs)

### Core Sample Endpoints
- `POST /api/v1/auth/login` — Login user & return JWT token
- `GET /api/v1/customers?search=Ahmedabad` — Filter customers by Indian city, GSTIN, or name
- `POST /api/v1/sales-challans` — Create Sales Challan with snapshot item pricing
- `PATCH /api/v1/sales-challans/:id/status` — Advance status to `DISPATCHED` (executes stock deduction)

---

## 📮 Postman Collection

A complete, ready-to-import Postman collection is included in the codebase:
- **File Path**: [`docs/postman/Mini-ERP-CRM.postman_collection.json`](./docs/postman/Mini-ERP-CRM.postman_collection.json)
- **Features**: Includes 25+ requests with automatic JWT token extraction script on login.

---

## 🔑 Seeded Demo Credentials

> Standard password for all seeded accounts: **`Admin@123`**

| Role Persona | Email Address | Password | Module Capabilities |
|:---|:---|:---|:---|
| 👑 **System Admin** | `admin@minierp.com` | `Admin@123` | Full administrative control across all CRM, Inventory, and Sales modules |
| 💼 **Sales Manager** | `sales@minierp.com` | `Admin@123` | Manage CRM customers, log follow-up notes, create & confirm Sales Challans |
| 📦 **Warehouse Manager** | `warehouse@minierp.com` | `Admin@123` | Product catalog, stock IN/OUT movements, low-stock threshold management |
| 📊 **Accounts Lead** | `accounts@minierp.com` | `Admin@123` | Read-only audit access across all customer profiles, inventory, and challans |

---

## ⚠️ Known Limitations & Future Roadmap

### Current Limitations
- Dashboard analytics refresh via manual button / HTTP polling rather than WebSockets.
- Challan PDF generation currently relies on browser native print rendering.

### Future Roadmap
- [ ] Export Sales Challans to GST-compliant PDF invoices.
- [ ] Real-time push notifications for stock shortage alerts via WebSockets.
- [ ] Automated SMS/WhatsApp notifications for customer follow-up reminders.
- [ ] Multi-location warehouse transfer transactions.

---

## 📄 License & Author

Distributed under the **MIT License** — see [`LICENSE`](./LICENSE) for full details.

Developed with precision by **[Farhan Khan](https://github.com/Farhankhan2903)** for the **Fundsroom Infotech Technical Assessment**.
