#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="${RAILWAY_SERVICE:-BE-test-app}"
POSTGRES_NAME="${RAILWAY_POSTGRES_NAME:-Postgres}"
REDIS_NAME="${RAILWAY_REDIS_NAME:-Redis}"

echo "Railway setup (run once after: railway login && railway link)"
echo "Service: $SERVICE_NAME"
echo ""

if ! command -v railway >/dev/null 2>&1; then
  echo "Install CLI: npm install -g @railway/cli"
  exit 1
fi

echo "→ Adding Postgres (skip if already exists)..."
railway add --database postgres || true

echo "→ Adding Redis (skip if already exists)..."
railway add --database redis || true

echo ""
echo "→ Linking env variables to $SERVICE_NAME..."

railway variable set "DATABASE_URL=\${{${POSTGRES_NAME}.DATABASE_URL}}" --service "$SERVICE_NAME"
railway variable set "REDIS_URL=\${{${REDIS_NAME}.REDIS_URL}}" --service "$SERVICE_NAME"
railway variable set "NODE_ENV=production" --service "$SERVICE_NAME"

echo ""
echo "Done. Redeploy will start automatically."
echo "Then: $SERVICE_NAME → Settings → Networking → Generate Domain"
echo ""
echo "If DATABASE_URL still missing, check Postgres service name in Dashboard"
echo "and rerun with: RAILWAY_POSTGRES_NAME=YourPostgresName ./scripts/railway-setup.sh"
