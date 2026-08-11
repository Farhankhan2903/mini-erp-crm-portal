import request from 'supertest';
import app from '../app';

describe('API Health & System Endpoints', () => {
  it('GET /health should return 200 OK with service info', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'Mini ERP + CRM API Server');
    expect(res.body).toHaveProperty('version', '1.0.0');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/v1 should return API welcome page', async () => {
    const res = await request(app).get('/api/v1').set('Accept', 'application/json');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('endpoints');
  });


  it('GET /docs should serve Swagger UI', async () => {
    const res = await request(app).get('/docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Swagger UI');
  });

  it('Protected endpoint without token should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toContain('Authentication token required');
  });


  it('POST /api/v1/auth/login with invalid credentials should return 401', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'nonexistent@minierp.com',
      password: 'WrongPassword123',
    });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });
});
