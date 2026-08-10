import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import productRoutes from './routes/product.routes';
import stockRoutes from './routes/stock.routes';
import challanRoutes from './routes/challan.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

// Core Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows inline scripts for Swagger UI & HTML landing portal
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Interactive Swagger OpenAPI Documentation Routes (/docs & /api-docs)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root API Welcome Endpoint
app.get('/', (req: Request, res: Response) => {
  if (req.accepts('html')) {
    res.redirect('/api/v1');
    return;
  }

  res.status(200).json({
    status: 'success',
    service: 'Mini ERP + CRM Operations Portal API Server',
    documentation: '/docs',
    health: '/health',
    apiV1: '/api/v1',
  });
});

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Mini ERP + CRM API Server',
    documentation: '/docs',
  });
});

// Top-Level Routes (/auth, /customers, /products, /stock-movements, /sales-challans, /dashboard)
app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/stock-movements', stockRoutes);
app.use('/sales-challans', challanRoutes);
app.use('/dashboard', dashboardRoutes);

// API v1 Routes Namespace (/api/v1/...)
app.use('/api/v1', routes);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
