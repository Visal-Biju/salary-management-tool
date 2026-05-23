import express from 'express';
import cors from 'cors';
import { employeesRouter } from './routes/employees';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/employees', employeesRouter);
  return app;
}
