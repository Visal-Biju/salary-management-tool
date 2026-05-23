import express from 'express';
import cors from 'cors';
import { employeesRouter } from './routes/employees';
import { insightsRouter } from './routes/insights';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/employees', employeesRouter);
  app.use('/api/insights', insightsRouter);
  return app;
}
