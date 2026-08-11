# 📖 API Documentation — Mini ERP + CRM Operations Portal

**Base URL**: `http://localhost:5001/api/v1` (dev) | `https://your-api.onrender.com/api/v1` (prod)

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Rate Limiting & Protection Rules
- **Authentication Rate Limit (`/auth/login`)**: 20 requests per 15-minute window per IP.
- **General API Rate Limit (`/api/v1/*`)**: 300 requests per 15-minute window per IP.
- **Payload Compression**: All JSON responses are automatically gzipped via `compression` middleware.

---

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5, "hasPrev": false, "hasNext": true }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": null
}
```

---

## 1. Authentication

### POST `/auth/login`
Login and receive a JWT token.

| | |
|:---|:---|
| **Auth Required** | ❌ No |
| **Roles** | All |

**Request Body**
```json
{
  "email": "admin@minierp.com",
  "password": "Admin@123"
}
```

**Response 200**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "name": "System Admin",
      "email": "admin@minierp.com",
      "role": "ADMIN",
      "createdAt": "2026-08-10T00:00:00.000Z"
    }
  }
}
```

**Error Codes**: `401` Invalid credentials, `422` Validation error

---

### POST `/auth/register`
Register a new staff user. Admin only.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | ADMIN |

**Request Body**
```json
{
  "name": "Jane Smith",
  "email": "jane@minierp.com",
  "password": "Password@123",
  "role": "SALES"
}
```

**Response 201** — Returns user object (without password)

---

### GET `/auth/me`
Get current user profile.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | All |

**Response 200** — Returns user object

---

## 2. Customers

### GET `/customers`
List customers with pagination, search, and filtering.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | ADMIN, SALES, ACCOUNTS |

**Query Parameters**
| Param | Type | Default | Description |
|:---|:---|:---|:---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | — | Searches name, email, mobile, businessName, gst |
| `status` | string | — | `LEAD`, `PROSPECT`, `ACTIVE`, `INACTIVE` |
| `customerType` | string | — | `RETAIL`, `WHOLESALE`, `CORPORATE` |
| `sortBy` | string | `createdAt` | `createdAt`, `name`, `status`, `followUpDate` |
| `sortOrder` | string | `desc` | `asc`, `desc` |

**Response 200** — Paginated list of customers

---

### POST `/customers`
Create a new customer.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | ADMIN, SALES |

**Request Body**
```json
{
  "name": "Acme Corp",
  "mobile": "+91 9876543210",
  "email": "contact@acme.com",
  "businessName": "Acme Corporation Ltd",
  "gst": "27AAACA1234A1Z5",
  "customerType": "CORPORATE",
  "address": "Mumbai, Maharashtra",
  "status": "LEAD",
  "notes": "First contact via referral"
}
```

**Response 201** — Created customer object  
**Error Codes**: `422` Validation error

---

### GET `/customers/:id`
Get customer by ID including notes history and past challans.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | ADMIN, SALES, ACCOUNTS |

**Response 200** — Customer with `notesHistory[]` and `salesChallans[]`  
**Error Codes**: `404` Customer not found

---

### PUT `/customers/:id`
Update customer fields.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | ADMIN, SALES |

**Request Body** — Any subset of customer fields (partial update)

---

### DELETE `/customers/:id`
Delete a customer permanently.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | ADMIN |

**Response 200** — `{ "message": "Customer deleted successfully" }`  
**Error Codes**: `404` Customer not found

---

### POST `/customers/:id/notes`
Add a follow-up note to a customer's audit trail.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | ADMIN, SALES |

**Request Body**
```json
{
  "note": "Spoke with decision maker. Demo scheduled.",
  "followUpDate": "2026-08-25T10:00:00.000Z"
}
```

**Response 200** — Updated customer with notes history

---

## 3. Products

### GET `/products`
List products with pagination and optional low-stock alert filter.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | All |

**Query Parameters**
| Param | Type | Default | Description |
|:---|:---|:---|:---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | — | Searches name, sku, category, warehouse |
| `category` | string | — | Filter by category |
| `warehouse` | string | — | Filter by warehouse |
| `lowStock` | boolean | — | If `true`, returns only `stock <= minimumStock` |
| `sortBy` | string | `createdAt` | `createdAt`, `name`, `sku`, `stock`, `unitPrice` |
| `sortOrder` | string | `desc` | `asc`, `desc` |

---

### POST `/products`
Create a new product. SKU is auto-uppercased and must be unique.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | ADMIN, WAREHOUSE |

**Request Body**
```json
{
  "name": "Polycab 3-Core Flexible Copper Cable 90m",
  "sku": "elec-cbl-3c-90m",
  "category": "Electrical Supplies",
  "unitPrice": 4250.00,
  "stock": 150,
  "minimumStock": 20,
  "warehouse": "Ahmedabad Central Depot"
}
```

**Response 201** — Created product (SKU stored as `ELEC-CBL-3C-90M`)  
**Error Codes**: `400` SKU already exists, `422` Validation error

---

### GET `/products/:id`
Get product by ID including the last 15 stock movement records.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | All |

**Response 200** — Product with `stockMovements[]`

---

### PUT `/products/:id`
Update product fields.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | ADMIN, WAREHOUSE |

---

### DELETE `/products/:id`
Delete a product. Sets `productId` to `null` in related challan items (snapshot preserved).

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | ADMIN |

---

## 4. Stock Movements

### GET `/stock-movements`
List stock movement audit log.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | ADMIN, WAREHOUSE, ACCOUNTS |

**Query Parameters**
| Param | Type | Description |
|:---|:---|:---|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `productId` | string | Filter by product ID |
| `movementType` | string | `IN`, `OUT`, or `ADJUSTMENT` |

---

### POST `/stock-movements`
Log a stock movement. Atomically updates product stock.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | ADMIN, WAREHOUSE |

**Request Body**
```json
{
  "productId": "uuid",
  "quantity": 10,
  "movementType": "IN",
  "reason": "Received from supplier"
}
```

**Movement Rules**:
- `IN`: `stock += quantity`
- `OUT`: `stock -= quantity` (returns `400` if `stock < quantity`)
- `ADJUSTMENT`: `stock = quantity` (absolute set)

**Response 201** — Movement record with product and user details

---

## 5. Sales Challans

### GET `/sales-challans`
List sales challans with pagination and filtering.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | All |

**Query Parameters**
| Param | Type | Description |
|:---|:---|:---|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `search` | string | Search by challan number or customer name |
| `status` | string | `DRAFT`, `CONFIRMED`, `DISPATCHED`, `DELIVERED`, `CANCELLED` |
| `customerId` | string | Filter by customer |
| `sortBy` | string | `createdAt`, `challanNumber`, `status`, `totalQuantity` |
| `sortOrder` | string | `asc`, `desc` |

---

### POST `/sales-challans`
Create a new sales challan.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | ADMIN, SALES |

**Request Body**
```json
{
  "customerId": "uuid",
  "status": "DRAFT",
  "items": [
    { "productId": "uuid-1", "quantity": 2 },
    { "productId": "uuid-2", "quantity": 5 }
  ]
}
```

**Business Logic**:
- Auto-generates challan number: `SCH-YYYYMMDD-XXXX`
- Stores product snapshot (name, SKU, price) for historical integrity
- If `status = CONFIRMED` or `DISPATCHED`: immediately deducts stock (transactional)
- Returns `400` if any product has insufficient stock

**Response 201** — Full challan with customer, items, and creator info

---

### GET `/sales-challans/:id`
Get challan by ID.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | All |

---

### PATCH `/sales-challans/:id/status`
Update challan status.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | ADMIN, SALES, WAREHOUSE |

**Request Body**
```json
{ "status": "CONFIRMED" }
```

**Status Workflow**:
```
DRAFT → CONFIRMED (triggers stock deduction)
CONFIRMED → DISPATCHED
DISPATCHED → DELIVERED
Any → CANCELLED (unless already DELIVERED)
CANCELLED or DELIVERED → rejected (400)
```

---

## 6. Dashboard

### GET `/dashboard/metrics`
Get all dashboard KPI data in a single request.

| | |
|:---|:---|
| **Auth Required** | ✅ Yes |
| **Roles** | All |

**Response 200**
```json
{
  "success": true,
  "data": {
    "cards": {
      "totalCustomers": 42,
      "totalProducts": 18,
      "todaysChallans": 3,
      "lowStockProducts": 2,
      "totalInventoryValue": 4521500.00
    },
    "lists": {
      "recentChallans": [...],
      "recentCustomers": [...]
    }
  }
}
```

Implementation uses `Promise.all` for parallel query execution — all 6 database queries run concurrently.

---

## 7. Health Check

### GET `/health`
Server health status. No authentication required.

**Response 200**
```json
{
  "status": "ok",
  "timestamp": "2026-08-11T12:00:00.000Z",
  "service": "Mini ERP + CRM API Server",
  "version": "1.0.0",
  "documentation": "/docs"
}
```

---

## HTTP Status Code Reference

| Code | Meaning | When Used |
|:---|:---|:---|
| `200` | OK | Successful GET, PUT, PATCH |
| `201` | Created | Successful POST |
| `400` | Bad Request | Business rule violation (insufficient stock, invalid status) |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | Authenticated but insufficient role |
| `404` | Not Found | Resource doesn't exist |
| `422` | Unprocessable Entity | Zod validation failure (field-level errors) |
| `500` | Internal Server Error | Unhandled exception |
