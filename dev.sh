#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# dev.sh  –  Start Backend, Frontend & Prisma Studio together
# Usage:  ./dev.sh
# ─────────────────────────────────────────────────────────────

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec node "$ROOT_DIR/dev.mjs" "$@"
