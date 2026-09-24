#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PB="$(which pocketbase)"
FRONTEND="$SCRIPT_DIR/frontend"

if [ -z "$PB" ]; then
  PB="$SCRIPT_DIR/pocketbase"
  if [ ! -f "$PB" ]; then
    echo "Error: pocketbase binary not found"
    echo "Download from https://pocketbase.io/docs/ and place it here"
    exit 1
  fi
fi

echo "=== Starting PocketBase (http://127.0.0.1:8090) ==="
mkdir -p "$SCRIPT_DIR/pb_data"
if [ ! -f "$SCRIPT_DIR/pb_data/data.db" ]; then
  echo "First run — creating superuser admin@example.com / changethis"
  "$PB" superuser upsert admin@example.com changethis \
    --dir "$SCRIPT_DIR/pb_data" \
    --migrationsDir "$SCRIPT_DIR/pb_migrations" \
    --hooksDir "$SCRIPT_DIR/pb_hooks" > /dev/null 2>&1
fi

"$PB" serve \
  --http 127.0.0.1:8090 \
  --dir "$SCRIPT_DIR/pb_data" \
  --migrationsDir "$SCRIPT_DIR/pb_migrations" \
  --hooksDir "$SCRIPT_DIR/pb_hooks" &

PB_PID=$!

# Wait for PocketBase to start
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:8090/api/health > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "=== Starting Vite dev server (http://127.0.0.1:5173) ==="
cd "$FRONTEND"
npx vite --host 127.0.0.1 &

VITE_PID=$!

echo ""
echo "  Invv is running!"
echo "  Frontend:  http://127.0.0.1:5173"
echo "  Backend:   http://127.0.0.1:8090"
echo "  Dashboard: http://127.0.0.1:8090/_/"
echo ""
echo "  Login: use the email of any user in the 'users' collection."
echo "  Create a user in the admin dashboard (Collections → users → New record)"
echo "========================================"
echo "Press Ctrl+C to stop"

trap "kill $PB_PID $VITE_PID 2>/dev/null; exit 0" INT TERM
wait
