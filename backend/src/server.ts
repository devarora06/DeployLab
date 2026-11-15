import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import projectRoutes from './routes/project.routes';
import { errorHandler } from './controllers/project.controller';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// CORS: only allow the origins listed in CORS_ORIGIN
const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Health check (also reports database connection state)
app.get('/api/health', (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/projects', projectRoutes);

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    // Listen on localhost only: Nginx is the public entry point in production
    const host = process.env.HOST || '127.0.0.1';
    app.listen(PORT, host, () => console.log(`API running on http://${host}:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
