# ⚠️ Known Limitations — Mini ERP + CRM Operations Portal

This document provides an honest assessment of current limitations in the system. These are acknowledged gaps that represent areas for future improvement.

---

## Functional Limitations

### 1. No PDF / Document Export
Sales Challans cannot currently be exported as PDF documents. Users would need to use browser print functionality as a workaround. A proper PDF export (e.g., using `pdfkit` or `puppeteer`) is listed in the roadmap.

### 2. No Email or SMS Integration
The follow-up date system tracks reminder dates but does not send automatic email or SMS notifications when a follow-up date is reached. This would require integration with a service like SendGrid, Twilio, or Nodemailer.

### 3. No File Attachments
Customers, products, or challans cannot have file attachments (e.g., signed challan copies, product images, purchase orders). Cloud storage integration (e.g., AWS S3 or Google Cloud Storage) is needed.

### 4. INR Currency Only
The system is hardcoded for Indian Rupee (₹) formatting. Multi-currency support with exchange rate conversion is not implemented.

### 5. No Challan Editing After Creation
Once a Sales Challan is created, line items cannot be modified. Only the status can be updated. This is an intentional design decision (snapshot integrity) but means corrections require cancellation and re-creation.

### 6. No Purchase Orders Module
There is no Purchase Order (PO) or supplier management module. Stock is added manually via the Stock Movements `IN` type.

### 7. No Real-Time Notifications
The dashboard shows point-in-time data that requires a manual refresh. There is no WebSocket or Server-Sent Events integration for real-time stock alerts or challan status notifications.

---

## Technical Limitations

### 8. No Automated Test Suite
The project does not include unit tests, integration tests, or end-to-end tests. This is a significant gap for a production system. The roadmap includes Jest/Supertest for API tests and Vitest/Testing Library for UI tests.

### 9. SQLite Not Suitable for Concurrent Production Use
The development database uses SQLite, which does not support concurrent writes well. This is appropriate for development only — production deployments must use PostgreSQL (Neon/Render Postgres).

### 10. JWT Token Cannot Be Revoked
JWT tokens are stateless and cannot be invalidated server-side. Once issued, a token remains valid for 24 hours even if the user logs out. A production system should implement a token blacklist (Redis) or use shorter-lived access tokens with refresh token rotation.

### 11. No Rate Limiting
The API does not implement request rate limiting, which makes it vulnerable to brute-force attacks on the login endpoint and general API abuse. `express-rate-limit` should be added before production use.

### 12. Password Reset Not Implemented
There is no "forgot password" or password reset flow. Admin users can create new accounts, but password recovery for existing users is not available.

### 13. No Pagination on Customer Notes or Challan Items
The Customer Detail view loads all historical notes and the last 10 challans. For long-term customers with hundreds of notes, this could impact performance.

### 14. No Logging Infrastructure
The application uses `console.error()` for error logging. A production system should use a structured logging library (e.g., Winston, Pino) with log levels, log aggregation (e.g., Datadog, Papertrail), and alerting.

---

## Performance Limitations

### 15. Low-Stock Filter Inefficiency
The current low-stock filter (`stock <= minimumStock`) fetches all products matching other filters first, then does in-memory filtering. For large product catalogs, this could be slow. A proper database-level filter using a Prisma `where` clause with a column comparison expression would be more efficient.

### 16. No Caching Layer
There is no caching (Redis, in-memory, or HTTP cache headers) for frequently read data like the dashboard metrics or product catalog. For high-traffic scenarios, this would create unnecessary database load.

---

## Security Limitations

### 17. Weak Default JWT Secret in Examples
The example `.env` files contain a placeholder JWT secret. While clearly labeled for replacement, a security review process should enforce that production secrets meet minimum entropy requirements.

### 18. No HTTPS Enforcement
The application relies on its hosting platforms (Render, Vercel) for HTTPS. There is no application-level HTTP-to-HTTPS redirect, which would be needed for self-hosted deployments.
