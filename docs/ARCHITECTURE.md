# 🏗️ System Architecture — Mini ERP + CRM Operations Portal

---

## Overview

The application follows a **clean, layered architecture** with clear separation of concerns across the frontend, API, and database tiers. Each layer has a single responsibility and communicates through well-defined interfaces.

---

## System Architecture Diagram

```mermaid
graph TB
    subgraph Client["🌐 Browser (Client)"]
        UI["React 19 SPA<br/>Vite + TailwindCSS v4"]
        AC["AuthContext<br/>(JWT + Role State)"]
        SVC["Axios Services<br/>(API Layer)"]
        UI --> AC
        UI --> SVC
    end

    subgraph Backend["⚙️ Backend API (Express + TypeScript)"]
        MW["Middlewares<br/>Helmet • CORS • Morgan • JWT Auth • Zod Validate"]
        RT["Routes Layer<br/>/api/v1/auth | /customers | /products<br/>/stock-movements | /sales-challans | /dashboard"]
        CT["Controllers<br/>(Request/Response Handlers)"]
        BL["Services / Business Logic<br/>AuthService • CustomerService • ProductService<br/>StockService • ChallanService • DashboardService"]
        EH["Global Error Handler<br/>(AppError | ZodError | 500)"]
        MW --> RT --> CT --> BL --> EH
    end

    subgraph ORM["🔧 Prisma ORM"]
        PR["Prisma Client<br/>(Type-safe Query Builder)"]
        TRX["$transaction<br/>(Atomic Operations)"]
        PR --> TRX
    end

    subgraph DB["🗄️ Database"]
        SQ["SQLite (Development)"]
        PG["PostgreSQL (Production)<br/>Neon Serverless"]
    end

    SVC -->|"HTTPS REST + Bearer JWT"| MW
    BL --> PR
    PR --> SQ
    PR --> PG

    style Client fill:#1e3a5f,color:#fff
    style Backend fill:#1a3a2a,color:#fff
    style ORM fill:#2d1b4a,color:#fff
    style DB fill:#3a1a1a,color:#fff
```

---

## Request Lifecycle

```mermaid
sequenceDiagram
    participant Browser
    participant AxiosInterceptor as Axios Interceptor
    participant ExpressMiddleware as Express Middleware
    participant JWTMiddleware as JWT Auth Middleware
    participant ZodValidate as Zod Validator
    participant Controller
    participant Service as Service (Business Logic)
    participant Prisma
    participant Database

    Browser->>AxiosInterceptor: API Request
    AxiosInterceptor->>ExpressMiddleware: Attach Bearer Token
    ExpressMiddleware->>JWTMiddleware: CORS + Helmet + Morgan
    JWTMiddleware->>ZodValidate: Verify JWT, attach req.user
    ZodValidate->>Controller: Validate request body schema
    Controller->>Service: Extract params, call service
    Service->>Prisma: Business logic + DB query
    Prisma->>Database: SQL query
    Database-->>Prisma: Result
    Prisma-->>Service: Typed response
    Service-->>Controller: DTO / Error
    Controller-->>Browser: JSON response (sendSuccess/sendError)
```

---

## Backend Layer Architecture

### Layer Responsibilities

| Layer | Files | Responsibility |
|:---|:---|:---|
| **Routes** | `*.routes.ts` | URL definitions, auth middleware wiring, Swagger JSDoc |
| **Controllers** | `*.controller.ts` | Parse request params, call service, send HTTP response |
| **Services** | `*.service.ts` | Business logic, validation rules, Prisma queries |
| **Middlewares** | `auth.ts`, `errorHandler.ts`, `validate.ts` | Cross-cutting concerns |
| **Validators** | `*.validator.ts` | Zod schemas for request body validation |
| **Config** | `env.ts`, `swagger.ts` | Environment validation, OpenAPI spec |
| **Utils** | `response.ts` | Consistent `sendSuccess` / `sendError` helpers |

### SOLID Principles Applied

- **Single Responsibility**: Each service class handles one domain (CustomerService, ChallanService, etc.)
- **Open/Closed**: New modules (e.g., Purchase Orders) can be added without modifying existing code
- **Interface Segregation**: DTOs defined per operation (CreateCustomerDTO, UpdateProductDTO)
- **Dependency Inversion**: Services depend on Prisma abstractions, not direct DB drivers

---

## Sales Challan Transaction Flow

```mermaid
flowchart TD
    A([Create Challan Request]) --> B{Customer exists?}
    B -->|No| C[400 Customer not found]
    B -->|Yes| D{All products exist?}
    D -->|No| E[400 Product not found]
    D -->|Yes| F[Build product snapshot items]
    F --> G[Generate Challan Number\nSCH-YYYYMMDD-XXXX]
    G --> H{Initial status?}
    H -->|DRAFT| I[Create Challan\nNo stock change]
    H -->|CONFIRMED / DISPATCHED| J[Create Challan]
    J --> K[processStockDeduction - inside $transaction]
    K --> L{stock >= quantity?}
    L -->|No| M[400 Insufficient Stock\nTransaction rolled back]
    L -->|Yes| N[Deduct stock atomically]
    N --> O[Log StockMovement OUT]
    O --> P([201 Challan Created])
    I --> P
```

---

## Authentication & Authorization Flow

```mermaid
flowchart LR
    Login([POST /auth/login]) --> A[AuthService.login]
    A --> B[bcrypt.compare password]
    B -->|Invalid| C[401 Invalid credentials]
    B -->|Valid| D[jwt.sign - 24h expiry]
    D --> E[Return token + user]

    ProtectedRoute([Protected Request]) --> F[authenticateUser middleware]
    F --> G{JWT valid?}
    G -->|No| H[401 Token invalid]
    G -->|Yes| I[req.user = decoded]
    I --> J[authorizeRoles middleware]
    J --> K{Role allowed?}
    K -->|No| L[403 Forbidden]
    K -->|Yes| M([Controller])
```

---

## Frontend Architecture

```mermaid
graph TD
    main["main.tsx"] --> App["App.tsx<br/>(BrowserRouter)"]
    App --> AuthProvider["AuthContext<br/>(JWT + Role state)"]
    App --> ToastProvider["ToastContext<br/>(Notification queue)"]
    App --> ProtectedRoute["ProtectedRoute<br/>(Redirect to /login if unauth)"]
    ProtectedRoute --> DashboardLayout["DashboardLayout<br/>(Sidebar + Header + Outlet)"]
    DashboardLayout --> Pages["Page Components<br/>(Dashboard, Customers, Products,\nInventory, Challans, Profile)"]
    Pages --> Services["Axios Services<br/>(api.ts + JWT interceptor)"]
    Pages --> Components["Common Components<br/>(Button, Card, Modal, Input...)"]
```

---

## Deployment Architecture

```mermaid
graph LR
    subgraph Vercel["Vercel CDN"]
        FE["React SPA\n(Static Build)"]
    end

    subgraph Render["Render.com"]
        BE["Express API\n(Node.js Web Service)"]
    end

    subgraph Neon["Neon.tech"]
        DB["PostgreSQL\n(Serverless)"]
    end

    User -->|HTTPS| FE
    FE -->|"HTTPS REST API\n(VITE_API_URL)"| BE
    BE -->|"PostgreSQL\n(DATABASE_URL)"| DB
```
