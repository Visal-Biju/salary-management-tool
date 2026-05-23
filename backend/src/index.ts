import 'dotenv/config';
import { createApp } from './app';
import { runMigrations } from './db/migrate';

const PORT = process.env.PORT ?? '3001';

async function start() {
  await runMigrations();
  const app = createApp();
  app.listen(Number(PORT), () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
