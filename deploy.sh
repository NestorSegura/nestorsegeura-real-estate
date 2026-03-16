#!/usr/bin/env bash
# deploy.sh — Automated deploy and rollback script for nestorsegura.com
# Usage:
#   ./deploy.sh          — Pull, build, copy assets, restart PM2
#   ./deploy.sh rollback — Revert to previous commit and restart PM2

set -e

APP_DIR="/var/www/nestorsegura.com"
PROCESS_NAME="nestorsegura.com"
ROLLBACK_HASH_FILE="$APP_DIR/.deploy_rollback_hash"

cd "$APP_DIR"

# ---- Rollback ----------------------------------------------------------------
if [ "${1:-}" = "rollback" ]; then
  if [ ! -f "$ROLLBACK_HASH_FILE" ]; then
    echo "ERROR: No rollback hash found at $ROLLBACK_HASH_FILE"
    exit 1
  fi
  PREV_HASH=$(cat "$ROLLBACK_HASH_FILE")
  echo "Rolling back to $PREV_HASH ..."
  git checkout "$PREV_HASH"
  # Fall through to build + restart below
else
  # ---- Normal deploy ----------------------------------------------------------
  echo "Saving current commit for rollback ..."
  git rev-parse HEAD > "$ROLLBACK_HASH_FILE"

  echo "Checking Node.js version (>=18 required) ..."
  node --version

  echo "Pulling latest code ..."
  git pull

  echo "Installing production dependencies ..."
  npm install --omit=dev
fi

# ---- Build -------------------------------------------------------------------
echo "Building Next.js application ..."
npm run build

# ---- Copy static assets into standalone output -------------------------------
echo "Copying static assets to standalone ..."
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# ---- Restart PM2 -------------------------------------------------------------
echo "Restarting PM2 process ..."
pm2 restart "$PROCESS_NAME" --update-env || pm2 start ecosystem.config.js
pm2 save

echo ""
echo "Deploy complete at $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
