#!/bin/zsh
# Build the site into its own directory, serve it on a spare port, and scrub
# /way for flashes (scripts/flash-check.py). Exit 1 on any flag.
#   zsh scripts/flash-check.sh [steps]
# .githooks/pre-push runs it when a push touches /way's film or map.
set -euo pipefail
cd "${0:A:h}/.."
STEPS=${1:-150}
PORT=3918
export NEXT_DIST_DIR=.next-flash
npx next build >/tmp/flash-check-build.log 2>&1 || { tail -20 /tmp/flash-check-build.log; exit 1; }
npx next start -p $PORT >/tmp/flash-check-serve.log 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
for i in $(seq 1 60); do curl -sf -o /dev/null http://localhost:$PORT/ && break; sleep 1; done
python3 scripts/flash-check.py http://localhost:$PORT/way --steps $STEPS --out /tmp/flash-check
