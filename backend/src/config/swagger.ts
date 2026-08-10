import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mini ERP + CRM Operations Portal API',
      version: '1.0.0',
      description:
        'Production REST API documentation for Fundsroom Infotech Mini ERP + CRM Operations Portal built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL.',
      contact: {
        name: 'Fundsroom Engineering Team',
        email: 'support@minierp.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001/api/v1',
        description: 'Local Development Server (API v1)',
      },
      {
        url: 'http://localhost:5001',
        description: 'Local Development Server (Top-Level)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Provide JWT access token obtained via /auth/login',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
