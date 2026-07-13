#!/usr/bin/env bash
# ReLoop AI — one-shot local bootstrap.
set -euo pipefail

cyan() { printf "\033[1;36m%s\033[0m\n" "$*"; }

cyan "▶ Installing backend deps…"
(cd Backend  && npm install)

cyan "▶ Installing frontend deps…"
(cd Frontend && npm install)

if [ ! -f Backend/.env ];  then cp Backend/.env.example  Backend/.env;  cyan "▶ Wrote Backend/.env from example — edit before real use";  fi
if [ ! -f Frontend/.env ]; then cp Frontend/.env.example Frontend/.env; cyan "▶ Wrote Frontend/.env from example"; fi

cat <<'EOF'

✅ Ready.

  Backend  (mock AI, no keys required):
    cd Backend  && npm run dev     # http://localhost:5000

  Frontend:
    cd Frontend && npm run dev     # http://localhost:5173

  Deploy:
    - Push to GitHub
    - Frontend: import the repo in Vercel (Root = Frontend)
    - Backend:  "New Blueprint" in Render (uses ./render.yaml)
    - See Docs/DEPLOYMENT.md for env vars
EOF
