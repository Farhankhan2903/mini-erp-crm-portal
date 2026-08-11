# 🔮 Future Improvements — Mini ERP + CRM Operations Portal

This document outlines planned improvements and features for future development phases.

---

## Priority 1 — Production Readiness

### 1. Automated Test Suite
**Impact: High | Effort: Medium**
- Unit tests for all service methods (Jest)
- API integration tests with Supertest (all endpoints with auth)
- React UI component tests (Vitest + Testing Library)
- E2E tests for critical flows: login, create challan, stock deduction (Playwright)
- Target: 80%+ code coverage

### 2. Rate Limiting & Brute Force Protection
**Impact: High | Effort: Low**
- Add `express-rate-limit` middleware
- Strict limits on `POST /auth/login` (e.g., 5 attempts per 15 minutes)
- General API rate limit (e.g., 100 requests per minute per IP)
- Redis-based distributed rate limiting for multi-instance deployments

### 3. JWT Refresh Token Rotation
**Impact: High | Effort: Medium**
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens stored in httpOnly cookies
- Token rotation on refresh to prevent replay attacks
- Token blacklist via Redis for logout invalidation

### 4. Structured Logging
**Impact: Medium | Effort: Low**
- Replace `console.log/error` with Pino or Winston
- Structured JSON log format
- Log levels: `debug`, `info`, `warn`, `error`
- Integration with Datadog, Papertrail, or Render's log streaming

---

## Priority 2 — Feature Completeness

### 5. PDF Export for Sales Challans
**Impact: High | Effort: Medium**
- Generate professional PDF challans with company header, line items, totals
- Download from the Challan Detail page
- Backend: `pdfkit` or `puppeteer` (headless Chrome)
- Include QR code with challan number for scanning

### 6. Email Notifications
**Impact: High | Effort: Medium**
- Automated follow-up reminder emails when `followUpDate` is reached
- Challan status change notifications to customers
- Low-stock alert emails to warehouse team
- Integration: SendGrid, Postmark, or AWS SES via Nodemailer

### 7. Purchase Orders Module
**Impact: High | Effort: High**
- Supplier management (name, contact, GST)
- Purchase Order creation and approval workflow
- Auto-trigger Stock IN movement on PO receipt
- PO-to-Challan linkage for supply chain visibility

### 8. Challan Line Item Editing
**Impact: Medium | Effort: Medium**
- Allow editing of DRAFT challan items (quantity adjustments)
- Lock editing once status moves to CONFIRMED
- Re-validate stock on each edit

### 9. Analytics Dashboard with Charts
**Impact: High | Effort: Medium**
- Revenue trends (monthly challan value)
- Top-selling products by quantity
- Customer acquisition over time
- Inventory value trend
- Integration: Recharts or Chart.js

### 10. Excel/CSV Export
**Impact: Medium | Effort: Low**
- Export customer list to CSV/Excel
- Export inventory report with valuation
- Export challan report by date range
- Backend: `xlsx` or `csv-writer` package

---

## Priority 3 — Advanced Features

### 11. Real-Time Notifications (WebSocket)
**Impact: Medium | Effort: High**
- WebSocket connection via `socket.io` or native WebSocket
- Real-time low-stock alerts to warehouse users
- Live challan status updates across browser tabs
- Dashboard metrics auto-refresh without manual polling

### 12. Multi-Currency Support
**Impact: Medium | Effort: Medium**
- Currency field per product (INR, USD, EUR)
- Exchange rate API integration for conversion
- Multi-currency challan display
- Base currency setting in admin configuration

### 13. Advanced RBAC with Permissions
**Impact: Medium | Effort: High**
- Granular permissions instead of coarse role-based rules
- Custom permission sets per user
- Resource-level access control (e.g., Sales user can only see their own challans)
- Admin permission matrix editor

### 14. Customer Portal (Self-Service)
**Impact: High | Effort: High**
- Separate login portal for customers
- View their own challan history and status
- Download their challans as PDF
- Submit support/inquiry tickets

### 15. Inventory Forecasting
**Impact: Medium | Effort: High**
- ML-based demand forecasting using historical movement data
- Automated reorder suggestions with recommended quantity
- Seasonal trend analysis
- Integration with BigQuery ML or custom Python model

### 16. Mobile App (React Native)
**Impact: High | Effort: Very High**
- Cross-platform mobile app for warehouse scanning
- Barcode/QR code scanning for stock movements
- Push notifications for low stock and follow-up reminders
- Offline-first capability for warehouse environments

---

## Technical Debt & Code Quality

### 17. Consistent Case-Insensitive Search (PostgreSQL)
- Current SQLite LIKE is case-insensitive by default; PostgreSQL's `contains` is case-sensitive
- Add `.mode('insensitive')` modifier to all search queries for PostgreSQL

### 18. Request Pagination Validation
- Add max limit caps to prevent `limit=999999` abuse
- Standardize pagination across all list endpoints

### 19. Prisma Query Optimization
- Add `select` to all list queries (avoid `SELECT *`)
- Evaluate `findFirst` vs `findUnique` usage
- Add connection pool configuration for PostgreSQL

### 20. OpenTelemetry Observability
- Add distributed tracing with OpenTelemetry
- Performance monitoring for slow queries
- Integration with Jaeger or Zipkin
