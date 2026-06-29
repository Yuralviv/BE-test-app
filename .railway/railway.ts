import {
  defineRailway,
  github,
  group,
  postgres,
  project,
  redis,
  service,
} from 'railway/iac';

export default defineRailway(() => {
  const db = postgres('be-mc-db');
  const cache = redis('be-mc-redis');

  const api = service('BE-test-app', {
    source: github('Yuralviv/BE-test-app', { branch: 'main' }),
    build: 'pnpm install --frozen-lockfile && pnpm build',
    start: 'npx prisma migrate deploy && node dist/main',
    healthcheck: '/',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: db.env.DATABASE_URL,
      REDIS_URL: cache.env.REDIS_URL,
      CORS_ORIGINS: 'http://localhost:5173,http://localhost:3000',
    },
  });

  const backend = group('BE MC', [db, cache, api]);

  return project('be-mc', {
    resources: [backend],
  });
});
