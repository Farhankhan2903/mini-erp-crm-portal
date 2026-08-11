import request from 'supertest';
import app from '../app';

describe('Comprehensive Mini ERP + CRM Integration Test Suite', () => {
  let authToken: string;
  let createdCustomerId: string;
  let createdProductId: string;
  let createdChallanId: string;

  describe('1. Authentication & User Profile', () => {
    it('POST /api/v1/auth/login should authenticate seeded admin user', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@minierp.com',
        password: 'Admin@123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('admin@minierp.com');
      // Password hash must never be exposed
      expect(res.body.data.user).not.toHaveProperty('password');

      authToken = res.body.data.token;
    });

    it('GET /api/v1/auth/me should return authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('admin@minierp.com');
    });
  });

  describe('2. Customer CRM Module', () => {
    it('POST /api/v1/customers should create a new customer', async () => {
      const res = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Acme Test Corp',
          mobile: '9876543210',
          email: 'contact@acmetest.com',
          businessName: 'Acme Enterprises',
          customerType: 'WHOLESALE',
          status: 'ACTIVE',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Acme Test Corp');
      createdCustomerId = res.body.data.id;
    });

    it('GET /api/v1/customers should list customers with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/customers?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('pagination');
    });

    it('POST /api/v1/customers/:id/notes should add a follow-up note', async () => {
      const res = await request(app)
        .post(`/api/v1/customers/${createdCustomerId}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          note: 'Followed up via phone call regarding bulk order requirements.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notes).toBeDefined();
    });
  });

  describe('3. Products & Stock Inventory Module', () => {
    it('POST /api/v1/products should create a new inventory product', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Industrial Widget X1',
          sku: `SKU-TEST-${Date.now()}`,
          category: 'Hardware',
          unitPrice: 49.99,
          stock: 100,
          minimumStock: 10,
          warehouse: 'Warehouse Alpha',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Industrial Widget X1');
      createdProductId = res.body.data.id;
    });

    it('GET /api/v1/products should retrieve list of products', async () => {
      const res = await request(app)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/stock-movements should record manual stock IN movement', async () => {
      const res = await request(app)
        .post('/api/v1/stock-movements')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: createdProductId,
          quantity: 25,
          movementType: 'IN',
          reason: 'Manual Inventory Adjustment',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.stock).toBe(125);
    });
  });

  describe('4. Sales Challans & Automated Stock Management', () => {
    it('POST /api/v1/sales-challans should generate sales challan and deduct stock on DISPATCHED', async () => {
      const res = await request(app)
        .post('/api/v1/sales-challans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: createdCustomerId,
          status: 'DISPATCHED',
          items: [
            {
              productId: createdProductId,
              quantity: 15,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('DISPATCHED');
      expect(res.body.data.items.length).toBe(1);
      createdChallanId = res.body.data.id;
    });

    it('GET /api/v1/sales-challans/:id should fetch challan details', async () => {
      const res = await request(app)
        .get(`/api/v1/sales-challans/${createdChallanId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdChallanId);
    });
  });

  describe('5. Dashboard Analytics', () => {
    it('GET /api/v1/dashboard/metrics should return key operational metrics', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/metrics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cards).toHaveProperty('totalCustomers');
      expect(res.body.data.cards).toHaveProperty('totalProducts');
      expect(res.body.data.cards).toHaveProperty('todaysChallans');
      expect(res.body.data.cards).toHaveProperty('lowStockProducts');
    });
  });
});
