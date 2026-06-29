#!/usr/bin/env bash
set -euo pipefail

echo "Railway setup (run once after: railway login && railway link)"
echo ""

if ! command -v railway >/dev/null 2>&1; then
  echo "Install CLI: npm install -g @railway/cli"
  exit 1
fi

echo "→ Adding Postgres..."
railway add --database postgres

echo "→ Adding Redis..."
railway add --database redis

echo ""
echo "Done. In Railway Dashboard → BE-test-app → Variables, add references:"
echo "  DATABASE_URL  → Postgres.DATABASE_URL"
echo "  REDIS_URL     → Redis.REDIS_URL"
echo "  CORS_ORIGINS  → http://localhost:5173"
echo ""
echo "Then: Settings → Networking → Generate Domain"
