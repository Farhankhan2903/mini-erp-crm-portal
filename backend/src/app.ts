import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { env } from './config/env';

const app: Application = express();

// Allowed origins — in production, restrict to your frontend domain
const allowedOrigins: string[] = env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

// Core Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows inline scripts for Swagger UI & HTML landing portal
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (env.NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: Origin '${origin}' is not allowed`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Interactive Swagger OpenAPI Documentation Routes (/docs & /api-docs)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root redirect
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
    version: '1.0.0',
    documentation: '/docs',
  });
});

// All API routes live under /api/v1 (auth, customers, products, stock-movements, sales-challans, dashboard)
app.use('/api/v1', routes);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
