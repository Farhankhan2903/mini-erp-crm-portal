import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import productRoutes from './product.routes';
import stockRoutes from './stock.routes';
import challanRoutes from './challan.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

const renderApiLandingHTML = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mini ERP + CRM API Server</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; display: flex; justify-content: center; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; max-width: 640px; width: 100%; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: #064e3b; color: #34d399; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; }
    h1 { font-size: 24px; font-weight: 900; margin: 16px 0 8px 0; color: #fff; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; }
    .btn-group { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none; transition: all 0.2s; }
    .btn-primary { background: #4f46e5; color: #fff; }
    .btn-primary:hover { background: #4338ca; }
    .btn-secondary { background: #334155; color: #f8fafc; }
    .btn-secondary:hover { background: #475569; }
    .endpoints { background: #0f172a; border-radius: 12px; padding: 16px; border: 1px solid #1e293b; }
    .endpoints h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 12px 0; }
    .endpoint-item { font-family: monospace; font-size: 13px; color: #38bdf8; padding: 6px 0; border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; }
    .endpoint-item:last-child { border-bottom: none; }
    .method { color: #34d399; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span style="width: 8px; height: 8px; background: #34d399; border-radius: 50%;"></span>
      API SERVER OPERATIONAL
    </div>
    <h1>Mini ERP + CRM Operations Portal API</h1>
    <p>The Express TypeScript backend API server is running on port 5001 connected to the database. Protected routes require JWT Authorization headers (<code>Bearer &lt;token&gt;</code>).</p>
    
    <div class="btn-group">
      <a href="/docs" class="btn btn-primary">📖 Open Interactive Swagger UI (/docs)</a>
      <a href="http://localhost:5173" class="btn btn-secondary">💻 Open Frontend Web App (:5173)</a>
    </div>

    <div class="endpoints">
      <h3>Available API Route Namespaces</h3>
      <div class="endpoint-item"><span>/api/v1/auth</span> <span class="method">POST / GET</span></div>
      <div class="endpoint-item"><span>/api/v1/customers</span> <span class="method">CRUD</span></div>
      <div class="endpoint-item"><span>/api/v1/products</span> <span class="method">CRUD</span></div>
      <div class="endpoint-item"><span>/api/v1/stock-movements</span> <span class="method">POST / GET</span></div>
      <div class="endpoint-item"><span>/api/v1/sales-challans</span> <span class="method">CRUD</span></div>
      <div class="endpoint-item"><span>/api/v1/dashboard</span> <span class="method">GET</span></div>
    </div>
  </div>
</body>
</html>
`;

// GET /api/v1 Information Endpoint
router.get('/', (req: Request, res: Response) => {
  if (req.accepts('html')) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(renderApiLandingHTML());
    return;
  }

  res.status(200).json({
    status: 'success',
    message: 'Mini ERP + CRM API v1 Server Operational',
    documentation: '/docs',
    health: '/health',
    endpoints: {
      auth: '/api/v1/auth',
      customers: '/api/v1/customers',
      products: '/api/v1/products',
      stockMovements: '/api/v1/stock-movements',
      salesChallans: '/api/v1/sales-challans',
      dashboard: '/api/v1/dashboard',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/stock-movements', stockRoutes);
router.use('/sales-challans', challanRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
