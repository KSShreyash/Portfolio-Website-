#!/usr/bin/env bash
# Rebuild, restart the production server, and capture screenshots.
# Usage: bash scripts/preview.sh [--skip-build] [shoot args...]
set -u
PORT=${PORT:-3100}
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SKIP_BUILD=0
if [ "${1:-}" = "--skip-build" ]; then SKIP_BUILD=1; shift; fi

if [ "$SKIP_BUILD" = "0" ]; then
  echo "── build ──"
  if ! npm run build 2>&1 | tail -n 14; then exit 1; fi
fi

echo "── restart server on :$PORT ──"
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort $PORT -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1
sleep 2
(npx next start --port "$PORT" > "$ROOT/.next-start.log" 2>&1 &)

for _ in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "http://127.0.0.1:$PORT/" 2>/dev/null)
  [ "$code" = "200" ] && { echo "server ready"; break; }
  sleep 1
done

echo "── shoot ──"
BASE_URL="http://127.0.0.1:$PORT" node scripts/shoot.mjs "$@"
