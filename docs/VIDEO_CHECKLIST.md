# ✅ Video Recording Checklist — Mini ERP + CRM Operations Portal

Use this checklist before and during your demo video recording to ensure nothing is missed.

---

## 🔧 Pre-Recording Setup

### Environment
- [ ] Backend server running: `cd backend && npm run dev` (Port 5001)
- [ ] Frontend server running: `cd frontend && npm run dev` (Port 5173)
- [ ] Database seeded with demo data: `npx tsx prisma/seed.ts`
- [ ] Prisma Studio verified (optional): `npx prisma studio`
- [ ] Browser resolution set to **1280×720** minimum
- [ ] Browser zoom set to **100%**
- [ ] Browser bookmarks bar **hidden**
- [ ] All unnecessary browser tabs **closed**

### Tools Ready
- [ ] Screen recording software open (OBS / Loom / QuickTime)
- [ ] Microphone tested and levels set
- [ ] Postman open with `Mini-ERP-CRM.postman_collection.json` imported
- [ ] VS Code open with project (for folder structure segment)
- [ ] GitHub repository page open in a browser tab

---

## 📋 Demo Recording Checklist (In Order)

### 1. GitHub Repository
- [ ] Show: `https://github.com/Farhankhan2903/mini-erp-crm-portal`
- [ ] Show: README.md (badges, overview, tech stack)
- [ ] Show: Folder structure in VS Code or GitHub file browser
- [ ] Show: `docs/` folder with all documentation files
- [ ] Show: `.github/workflows/ci.yml` (CI pipeline)

### 2. README & Documentation
- [ ] Show: README badges (Node.js, TypeScript, React, Prisma, MIT)
- [ ] Show: Tech stack table
- [ ] Show: Demo credentials section
- [ ] Show: `docs/ARCHITECTURE.md` — Mermaid architecture diagram
- [ ] Show: `docs/DATABASE.md` — ER diagram
- [ ] Show: `docs/DEPLOYMENT.md`

### 3. Backend — Server Running
- [ ] Show terminal with `npm run dev` output
- [ ] Open: `http://localhost:5001/health` — show JSON response
- [ ] Open: `http://localhost:5001/api/v1` — show HTML landing page
- [ ] Open: `http://localhost:5001/docs` — show Swagger UI

### 4. Frontend — App Running
- [ ] Open: `http://localhost:5173/login`
- [ ] Show: login page design and quick-login buttons

### 5. Authentication
- [ ] Login as **Admin** using quick-login button
- [ ] Show: role badge in header (ADMIN — indigo)
- [ ] Switch to **Sales** role — show SALES badge
- [ ] Switch to **Warehouse** role — show WAREHOUSE badge
- [ ] Switch back to **Admin**

### 6. Dashboard
- [ ] Show all 5 KPI cards with data
- [ ] Show: Low Stock Alert card highlighted in red (>0 alerts)
- [ ] Show: Total Inventory Value in ₹ format
- [ ] Show: Recent Sales Challans list
- [ ] Show: Recent Customers list
- [ ] Click: Refresh button

### 7. Customer CRUD
- [ ] Open Customers page
- [ ] Show: paginated customer list with status badges
- [ ] Demonstrate: search by name or email
- [ ] Demonstrate: filter by status (ACTIVE, LEAD, etc.)
- [ ] Click: Create Customer → fill form → submit → show success toast
- [ ] Click: Customer row → open Customer Detail
- [ ] Show: Notes History tab
- [ ] Click: Add Follow-Up Note → fill note + date → submit
- [ ] Show: note appears in history

### 8. Product CRUD
- [ ] Open Products page
- [ ] Show: Low Stock Alert badges (products in red)
- [ ] Demonstrate: search and filter
- [ ] Click: Create Product → fill form → submit
- [ ] Open Product Detail — show stock movement history

### 9. Inventory (Stock Movements)
- [ ] Open Inventory page
- [ ] Show: audit log with IN/OUT/ADJUSTMENT type badges
- [ ] Click: Log Stock IN → fill form → submit → show updated stock
- [ ] Attempt Stock OUT exceeding stock → show 400 error response

### 10. Sales Challan Workflow
- [ ] Click: Create Sales Challan (from sidebar or header)
- [ ] Select: customer from dropdown
- [ ] Add: 2 products with quantities
- [ ] Set: status to DRAFT
- [ ] Submit → show auto-generated challan number `SCH-YYYYMMDD-XXXX`
- [ ] Open challan detail → show product snapshot data
- [ ] Click: Update Status → CONFIRMED → observe stock deducted
- [ ] Click: Update Status → DISPATCHED → DELIVERED

### 11. API Demonstration (Postman)
- [ ] Run: **Login — Admin** → show JWT token auto-saved in collection variables
- [ ] Run: **List Customers** → show paginated JSON response with `pagination` meta
- [ ] Run: **Create Sales Challan (DRAFT)** → show auto-generated challan number
- [ ] Run: **Get Dashboard Metrics** → show all KPI data in one response
- [ ] Show: 401 response on an unauthenticated request
- [ ] Show: 403 response on a role-forbidden request

### 12. Database Verification
- [ ] Open: `npx prisma studio` in browser
- [ ] Show: `sales_challans` table — records with challan numbers
- [ ] Show: `stock_movements` table — audit trail entries
- [ ] Show: `sales_challan_items` table — product snapshot data

### 13. GitHub & CI
- [ ] Show: GitHub repository commit history
- [ ] Show: GitHub Actions CI tab — green passing workflow
- [ ] Show: `.github/workflows/ci.yml` file content

### 14. Closing
- [ ] Return to README on GitHub
- [ ] Summarize: Architecture, Business Logic, RBAC, Stock Protection, Snapshot Isolation
- [ ] Mention: Full Postman collection, Swagger UI, comprehensive docs/ folder

---

## 🎬 Post-Recording

- [ ] Review recording for audio clarity
- [ ] Trim dead space at start and end
- [ ] Add captions if possible (Accessibility)
- [ ] Export at **1080p** minimum
- [ ] Upload to: Loom / Google Drive / YouTube (unlisted)
- [ ] Add video link to README.md demo section
