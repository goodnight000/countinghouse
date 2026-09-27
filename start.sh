#!/usr/bin/env bash
# One command: GBrain + finance server + dashboard + QM agent, all local.
#   OPENROUTER_API_KEY=sk-or-... ADMIN_EMAIL=you@example.com ./start.sh
set -euo pipefail
cd "$(dirname "$0")"
ROOT=$PWD
mkdir -p .run

for bin in bun node npm docker git; do command -v "$bin" >/dev/null || { echo "missing: $bin"; exit 1; }; done

# 1. GBrain (Garry Tan's open-source brain), vendored and initialized locally.
if [ ! -d vendor/gbrain ]; then
  git clone -q --depth 1 https://github.com/garrytan/gbrain vendor/gbrain
  (cd vendor/gbrain && bun install --silent)
fi
export GBRAIN_CLI="$ROOT/vendor/gbrain/src/cli.ts"
[ -d "$HOME/.gbrain" ] || bun "$GBRAIN_CLI" init --pglite --no-embedding >/dev/null

# 2. Finance server (:4001) and dashboard (:5190).
(cd web && [ -d node_modules ] || npm install --silent)
lsof -iTCP:4001 -sTCP:LISTEN >/dev/null 2>&1 || (cd server && nohup bun run src/index.ts > "$ROOT/.run/server.log" 2>&1 &)
lsof -iTCP:5190 -sTCP:LISTEN >/dev/null 2>&1 || (cd web && nohup npm run dev > "$ROOT/.run/web.log" 2>&1 &)

# 3. QM agent (Docker). Colima keeps its socket at a different path inside its VM.
cd qm
[ -d node_modules ] || npm install --silent
if [ -n "${ADMIN_EMAIL:-}" ]; then
  sed -i.bak -E "s/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+(:org_admin)/${ADMIN_EMAIL}\1/; s/(\"PORTAL_DEV_PRINCIPAL\": \")[^\"]+/\1${ADMIN_EMAIL}/" qm.config.jsonc && rm -f qm.config.jsonc.bak
fi
node ../scripts/qm-env.mjs
if docker context show 2>/dev/null | grep -q colima; then
  node ../scripts/patch-qm-colima.mjs
  export DOCKER_HOST="unix://$HOME/.colima/default/docker.sock" QM_DOCKER_SOCKET_MOUNT=/var/run/docker.sock
  QM_DOCKER_SOCKET_GID=$(colima ssh -- stat -c %g /var/run/docker.sock); export QM_DOCKER_SOCKET_GID
fi
npm exec qm -- up || npm exec qm -- up   # core can time out on first boot under emulation
cd "$ROOT"

# 4. Give the QM agent the finance tools (MCP over HTTP, reached from inside Docker).
scripts/qm-register-books.sh

echo
echo "Dashboard  http://localhost:5190"
echo "Agent chat http://localhost:8081   ($(grep '^# Demo sign-in' qm/.env | cut -c3-))"
