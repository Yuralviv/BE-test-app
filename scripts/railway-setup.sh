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

if ! railway status >/dev/null 2>&1; then
  echo "No linked project. Run: railway link"
  exit 1
fi

echo "→ Linking env variables to $SERVICE_NAME..."
echo "  (Postgres/Redis must already exist in the project — this script does NOT create databases)"
echo ""

railway variable set "DATABASE_URL=\${{${POSTGRES_NAME}.DATABASE_URL}}" --service "$SERVICE_NAME"
railway variable set "REDIS_URL=\${{${REDIS_NAME}.REDIS_URL}}" --service "$SERVICE_NAME"
railway variable set "NODE_ENV=production" --service "$SERVICE_NAME"

echo ""
echo "Done. Redeploy will start automatically."
echo ""
echo "If DATABASE_URL is missing, check Postgres service name in Dashboard"
echo "and rerun with: RAILWAY_POSTGRES_NAME=YourPostgresName ./scripts/railway-setup.sh"
