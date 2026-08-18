#!/bin/bash
# run — start agent-escalation.
#   ./run.sh            dashboard (Vite)      -> http://localhost:5174
#   ./run.sh storybook  component library     -> http://localhost:6007
# Idempotent: frees a stale port, installs deps if missing, then starts.
set -euo pipefail
cd "$(dirname "$0")"

MODE="${1:-dev}"
if [ "$MODE" = "storybook" ] || [ "$MODE" = "sb" ]; then
  PORT=6007; CMD=(npm run storybook)
  URL="http://localhost:$PORT"
else
  PORT=5174; CMD=(npx vite --port "$PORT" --strictPort)
  URL="http://localhost:$PORT"
fi

# Free the port if a stale instance of THIS app is holding it.
lsof -tiTCP:$PORT -sTCP:LISTEN 2>/dev/null | xargs kill -9 2>/dev/null || true

[ -d node_modules ] || npm install

echo "=> agent-escalation -> $URL"
[ "$MODE" = "dev" ] && echo "   widget preview  -> $URL/widget.html"
( sleep 3; command -v open >/dev/null && open "$URL" ) &
exec "${CMD[@]}"
