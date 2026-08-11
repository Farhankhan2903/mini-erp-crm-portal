# 🎬 Video Script — Mini ERP + CRM Operations Portal Demo

**Estimated Duration**: 5–8 minutes  
**Audience**: Technical hiring panel / Assessment reviewers  
**Format**: Screen recording with voiceover

---

## Pre-Recording Setup Checklist

- [ ] Backend running on port 5001
- [ ] Frontend running on port 5173
- [ ] Database seeded with demo data
- [ ] Browser at 1280×720 resolution
- [ ] Screen recording software ready (OBS / Loom / QuickTime)
- [ ] Browser bookmark bar hidden
- [ ] All unnecessary browser tabs closed
- [ ] Postman imported and ready

---

## SEGMENT 1 — Introduction (0:00 – 0:30)

**[Show: GitHub repository page]**

> "Hello, and welcome. I'm going to walk you through the Mini ERP + CRM Operations Portal I built for the Fundsroom Infotech Full Stack Developer assessment. This is a production-grade internal business management system built with Node.js, Express, TypeScript, Prisma ORM, React 19, Vite, and Tailwind CSS."

---

## SEGMENT 2 — Project Overview & Architecture (0:30 – 1:30)

**[Show: README.md on GitHub]**

> "The project is a monorepo with two main applications — a backend REST API and a React frontend SPA. Let me start by showing you the architecture."

**[Show: docs/ARCHITECTURE.md — system architecture Mermaid diagram]**

> "The backend follows a clean layered architecture: Routes → Controllers → Services → Prisma ORM → Database. All requests go through JWT authentication middleware and Zod schema validation. The frontend uses React Context for auth state and Axios with Bearer token interceptors."

---

## SEGMENT 3 — Technology Stack (1:30 – 2:00)

**[Show: README.md Tech Stack table]**

> "The tech stack is fully TypeScript on both sides. Backend uses Express 5, Prisma 7, JWT, bcrypt, Helmet, CORS, and Zod. Frontend uses React 19, Vite 8, Tailwind CSS v4, React Router 7, and React Hook Form. For production, the database is Neon PostgreSQL, backend on Render, and frontend on Vercel."

---

## SEGMENT 4 — Folder Structure (2:00 – 2:30)

**[Show: VS Code or file explorer with the project open]**

> "The project structure is clean and scalable. Backend has config, controllers, services, middlewares, routes, validators, types, and utils. Frontend has pages, layouts, components, context, services, types, constants, and utils. Everything is organized by feature and responsibility."

---

## SEGMENT 5 — Database Schema (2:30 – 3:00)

**[Show: docs/DATABASE.md — ER diagram]**

> "The database has 6 tables: users, customers, customer_notes, products, stock_movements, sales_challans, and sales_challan_items. All tables use UUID primary keys. Sales challan items store a product snapshot — so historical challans are never affected by future price changes."

---

## SEGMENT 6 — Authentication Demo (3:00 – 3:45)

**[Show: Login page at localhost:5173/login]**

> "The login page supports 4 demo roles. Let me quickly switch between them using the quick-login buttons."

**[Click: Admin button, then Sales, then Warehouse]**

> "Each role gets a different badge in the header. Authentication uses JWT with a 24-hour expiry, bcrypt password hashing, and role-based middleware on every protected route."

**[Login as Admin]**

---

## SEGMENT 7 — Dashboard (3:45 – 4:15)

**[Show: Dashboard page]**

> "The dashboard shows 5 real-time KPI cards — Total Customers, Products, Today's Challans, Low Stock Alert count, and Total Inventory Value in Indian Rupees. These are fetched in parallel using Promise.all. Below are the recent challans and recent customer streams."

**[Click: Refresh button]**

---

## SEGMENT 8 — Customer CRM Module (4:15 – 4:45)

**[Show: Customers page]**

> "The Customer CRM has paginated search across name, email, mobile, business name, and GST. I can filter by status and customer type."

**[Click: Create Customer button, fill form, submit]**

> "Let me create a new customer... and now open their detail page."

**[Click: Customer row → Customer Detail]**

> "The detail page shows their notes history and past challans. I can add a follow-up note with a reminder date."

---

## SEGMENT 9 — Products & Inventory (4:45 – 5:15)

**[Show: Products page]**

> "The Products page shows the catalog with Low Stock Alert badges for products below their minimum threshold. The warehouse column tells us physical location."

**[Switch to Inventory/Stock Movements page]**

> "The Stock Movements page is the audit log. Let me log a new stock IN movement."

**[Fill and submit the form]**

> "The stock count updated atomically. If I try to take OUT more than the available stock, the system prevents it."

---

## SEGMENT 10 — Sales Challan Workflow (5:15 – 6:15)

**[Click: Create Sales Challan button]**

> "This is the core ERP feature. I select a customer, add products with quantities, and choose the initial status."

**[Fill form: select customer, add 2 products, set status DRAFT, submit]**

> "Notice the challan number is auto-generated: SCH-YYYYMMDD-XXXX. The products are stored as snapshots — name, SKU, and price — so future edits to the product catalog don't affect this record."

**[Show: Challan detail, then click Update Status → CONFIRMED]**

> "Transitioning from DRAFT to CONFIRMED triggers a transactional stock deduction inside a Prisma transaction. If there's insufficient stock, the entire transaction rolls back."

---

## SEGMENT 11 — API Demonstration in Postman (6:15 – 6:45)

**[Open Postman, show collection]**

> "The project includes a complete Postman collection with 25+ endpoints. Let me run the Login request..."

**[Run Login → Admin, show token saved]**

> "The login test script automatically saves the JWT token. Now I can run any other endpoint."

**[Run GET /customers, GET /dashboard/metrics]**

> "All responses follow a consistent format: success boolean, message, data, and optional pagination metadata."

---

## SEGMENT 12 — Swagger API Documentation (6:45 – 7:00)

**[Open: localhost:5001/docs]**

> "The backend also has interactive Swagger UI documentation at /docs with all endpoints, schemas, and the ability to try requests directly from the browser."

---

## SEGMENT 13 — Deployment & GitHub (7:00 – 7:30)

**[Show: GitHub repository main page]**

> "The repository is at github.com/Farhankhan2903/mini-erp-crm-portal with a professional README, complete documentation in the docs/ folder, and a GitHub Actions CI pipeline."

**[Show: .github/workflows/ci.yml]**

> "The CI runs TypeScript typechecks and build verification on every push. For production, the backend deploys to Render with a Neon PostgreSQL database, and the frontend deploys to Vercel."

---

## SEGMENT 14 — Closing (7:30 – 8:00)

**[Show: README.md Demo Credentials table]**

> "The project is fully documented with architecture diagrams, database ER diagrams, an API reference, deployment guide, and this complete Postman collection. I'm confident this demonstrates clean architecture, production-quality code, and strong full-stack engineering capabilities. Thank you for watching."

---

## Recording Tips

- Use a **quiet environment** with minimal background noise
- Speak **clearly and at a measured pace** — don't rush
- Use a **wireless mouse** to avoid click sounds
- Rehearse the demo flow **at least twice** before recording
- Have the browser at **1280×720** for clear recording at 1080p
- Record in **segments** — you can cut and join in editing
