import app from './app';
import { env } from './config/env';

const PORT = Number(env.PORT) || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mini ERP + CRM Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  console.log(`🔗 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔗 API Base Endpoint: http://localhost:${PORT}/api/v1`);
});

process.on('unhandledRejection', (reason: Error) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export default server;
