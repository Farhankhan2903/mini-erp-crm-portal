# 📁 Project Structure — Mini ERP + CRM Operations Portal

This document provides an annotated breakdown of every folder and file in the repository.

---

## Root Directory

```
mini-erp-crm-portal/
│
├── backend/                    ← Express + TypeScript REST API
├── frontend/                   ← React 19 + Vite + TailwindCSS SPA
├── docs/                       ← All documentation files
├── .github/
│   └── workflows/
│       └── ci.yml              ← GitHub Actions CI pipeline
├── docker-compose.yml          ← Multi-service Docker stack (postgres + backend + frontend)
├── package.json                ← Root workspace convenience scripts
├── vercel.json                 ← Vercel monorepo routing config
├── .gitignore                  ← Comprehensive gitignore
└── LICENSE                     ← MIT License
```

---

## Backend (`backend/`)

```
backend/
│
├── prisma/
│   ├── schema.prisma           ← Prisma data model (6 models, indexes, relations)
│   ├── seed.ts                 ← Demo data seeder (4 users, 3 customers, 4 products, 1 challan)
│   └── migrations/             ← Prisma SQL migration history files
│
├── src/
│   ├── index.ts                ← Server entry point — creates HTTP server, handles uncaught exceptions
│   ├── app.ts                  ← Express application factory — registers middleware and routes
│   │
│   ├── config/
│   │   ├── env.ts              ← Zod-validated environment variable parsing (fails fast on missing vars)
│   │   └── swagger.ts          ← Swagger/OpenAPI 3.0 spec configuration (jsdoc-based)
│   │
│   ├── controllers/            ← Thin HTTP layer — parses request, calls service, sends response
│   ├── interfaces/             ← Interface contracts for repositories and services
│   ├── repositories/           ← Repository pattern layer — decouples database ORM queries
│   ├── services/               ← Business logic layer — all database operations and rules
│   ├── __tests__/              ← Jest + Supertest API and integration test suites
│   │   ├── api.test.ts
│   │   └── integration.test.ts
│   │
│   ├── middlewares/
│   │   ├── auth.ts             ← JWT verify middleware (authenticateUser) + role guard (authorizeRoles)
│   │   ├── errorHandler.ts     ← Global error handler: AppError, ZodError, uncaught 500
│   │   └── validate.ts         ← Zod schema validation middleware factory
│   │
│   ├── routes/
│   │   ├── index.ts            ← API v1 router + HTML landing page endpoint
│   │   ├── auth.routes.ts      ← POST /login, POST /register, GET /me
│   │   ├── customer.routes.ts  ← GET/POST /customers, GET/PUT/DELETE /customers/:id, POST /:id/notes
│   │   ├── product.routes.ts   ← GET/POST /products, GET/PUT/DELETE /products/:id
│   │   ├── stock.routes.ts     ← GET/POST /stock-movements
│   │   ├── challan.routes.ts   ← GET/POST /sales-challans, GET /:id, PATCH /:id/status
│   │   └── dashboard.routes.ts ← GET /dashboard/metrics
│   │
│   ├── validators/             ← Zod schemas for request body validation
│   │   ├── auth.validator.ts
│   │   ├── customer.validator.ts
│   │   ├── product.validator.ts
│   │   ├── stock.validator.ts
│   │   └── challan.validator.ts
│   │
│   ├── types/
│   │   ├── enums.ts            ← Role, CustomerType, CustomerStatus, MovementType, ChallanStatus
│   │   └── express.d.ts        ← Extends Express Request with req.user (AuthUser type)
│   │
│   └── utils/
│       └── response.ts         ← sendSuccess() / sendError() helpers for consistent API responses
│
├── .env                        ← Local environment variables (gitignored)
├── .env.example                ← Environment variable template
├── package.json                ← Dependencies and npm scripts
├── tsconfig.json               ← TypeScript compiler configuration
├── Dockerfile                  ← Multi-stage Docker build for production
└── .eslintrc.json              ← ESLint configuration
```

---

## Frontend (`frontend/`)

```
frontend/
│
└── src/
    ├── main.tsx                ← React DOM root mount
    ├── App.tsx                 ← Router setup, route guards, layout wiring
    │
    ├── pages/                  ← Route-level components (one per page)
    │   ├── LoginPage.tsx       ← Login form + quick demo role buttons
    │   ├── DashboardPage.tsx   ← KPI cards + recent activity streams
    │   ├── CustomersPage.tsx   ← Customer list with search/filter/pagination/CRUD modals
    │   ├── CustomerDetailPage.tsx ← Customer detail, notes history, past challans
    │   ├── ProductsPage.tsx    ← Product catalog with low-stock alert badges
    │   ├── InventoryPage.tsx   ← Stock movement log and adjustment form
    │   ├── SalesChallansPage.tsx ← Challan list with status workflow buttons
    │   ├── CreateChallanPage.tsx ← Multi-product challan creation form
    │   ├── ProfilePage.tsx     ← Current user profile display
    │   └── NotFoundPage.tsx    ← 404 error page with navigation
    │
    ├── layouts/
    │   ├── DashboardLayout.tsx ← Sidebar + header layout shell (Outlet-based)
    │   └── ProtectedRoute.tsx  ← Redirects unauthenticated users to /login
    │
    ├── hooks/                  ← Custom React hooks (useDebounce, usePagination, useDisclosure)
    ├── __tests__/              ← Vitest + React Testing Library component unit tests
    │   └── Button.test.tsx
    │
    ├── components/
    │   └── common/             ← Reusable primitive components
    │       ├── Button.tsx      ← Primary/outline/ghost variants, loading state, icon support
    │       ├── Card.tsx        ← Card + StatCard components
    │       ├── Input.tsx       ← Labelled input with icon and error state
    │       ├── Select.tsx      ← Labelled select with options
    │       ├── Modal.tsx       ← Accessible modal with overlay
    │       ├── Badge.tsx       ← Status badge (success/warning/danger/info/neutral/purple)
    │       ├── Spinner.tsx     ← Loading spinner (sm/md/lg sizes)
    │       ├── Pagination.tsx  ← Pagination controls with prev/next/page numbers
    │       ├── SearchInput.tsx ← Debounced search input component
    │       ├── ToastContainer.tsx ← Auto-dismissing toast notification stack
    │       ├── ErrorBoundary.tsx  ← React Error Boundary error fallback component
    │       └── Skeleton.tsx    ← Table and Card skeleton loaders
    │
    ├── context/
    │   ├── AuthContext.tsx     ← Auth state (user, token, login, logout, hasRole)
    │   └── ToastContext.tsx    ← Toast notification queue
    │
    ├── services/               ← Axios API client wrappers per module
    │   ├── api.ts              ← Axios instance with JWT interceptor + 401 logout
    │   ├── authService.ts
    │   ├── customerService.ts
    │   ├── productService.ts
    │   ├── stockService.ts
    │   ├── challanService.ts
    │   └── dashboardService.ts
    │
    ├── types/
    │   └── index.ts            ← Shared TypeScript interfaces (User, Customer, Product, etc.)
    │
    ├── constants/
    │   └── index.ts            ← APP_NAME, roles, status options, storage keys, API_BASE_URL
    │
    └── utils/
        └── formatters.ts       ← formatINR() — Indian Rupee currency formatting (Intl.NumberFormat)
```

---

## Docs (`docs/`)

```
docs/
├── postman/
│   └── Mini-ERP-CRM.postman_collection.json  ← Full Postman collection (25+ endpoints)
├── screenshots/
│   └── README.md              ← Screenshot capture instructions
├── ARCHITECTURE.md            ← System architecture + Mermaid diagrams
├── DATABASE.md                ← ER diagram + table documentation
├── DEPLOYMENT.md              ← Neon + Render + Vercel deployment guide
├── API_DOCUMENTATION.md       ← Full REST API reference
├── PROJECT_STRUCTURE.md       ← This file
├── KNOWN_LIMITATIONS.md       ← Current system limitations
├── FUTURE_IMPROVEMENTS.md     ← Roadmap and planned features
├── VIDEO_SCRIPT.md            ← 5–8 minute demo video script
└── VIDEO_CHECKLIST.md         ← Pre-recording and recording checklist
```
