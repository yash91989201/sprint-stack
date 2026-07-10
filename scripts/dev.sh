#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -n "${NO_COLOR:-}" ]]; then
  COLOR_RESET=""
  COLOR_RED=""
  COLOR_GREEN=""
  COLOR_YELLOW=""
  COLOR_BLUE=""
else
  COLOR_RESET="\033[0m"
  COLOR_RED="\033[31m"
  COLOR_GREEN="\033[32m"
  COLOR_YELLOW="\033[33m"
  COLOR_BLUE="\033[34m"
fi

log_info() { printf "%b[INFO]%b %s\n" "$COLOR_BLUE" "$COLOR_RESET" "$*"; }
log_success() { printf "%b[OK]%b %s\n" "$COLOR_GREEN" "$COLOR_RESET" "$*"; }
log_error() { printf "%b[ERROR]%b %s\n" "$COLOR_RED" "$COLOR_RESET" "$*" >&2; }

check_command() {
  local cmd="$1"
  command -v "$cmd" >/dev/null 2>&1 || {
    log_error "Missing command: $cmd"
    return 1
  }
}

require_root() {
  [[ -f "$ROOT_DIR/package.json" ]] || {
    log_error "Run from repository root: $ROOT_DIR"
    exit 1
  }
}

check_deps() {
  check_command bun
}

USAGE="Usage: scripts/dev.sh {update-packages|--help}"

case "${1:-}" in
--help | help)
  echo "$USAGE"
  exit 0
  ;;
update-packages)
  ;;
"")
  echo "Error: missing command" >&2
  echo "$USAGE" >&2
  exit 1
  ;;
*)
  echo "Error: unknown command '$1'" >&2
  echo "$USAGE" >&2
  exit 1
  ;;
esac

cmd_update_packages() {
  require_root
  check_deps
  log_info "Updating root packages"
  (
    cd "$ROOT_DIR"
    bun update --latest
  )
  local parent=""
  local child=""
  for parent in apps packages workers; do
    [[ -d "$ROOT_DIR/$parent" ]] || continue
    for child in "$ROOT_DIR/$parent"/*; do
      if [[ -d "$child" && -f "$child/package.json" ]]; then
        log_info "Updating ${child#"$ROOT_DIR"/}"
        (
          cd "$child"
          bun update --latest
        )
      fi
    done
  done
  log_info "Cleaning up node_modules and lock files"
  for parent in apps packages workers; do
    [[ -d "$ROOT_DIR/$parent" ]] || continue
    for child in "$ROOT_DIR/$parent"/*; do
      if [[ -d "$child" && -f "$child/package.json" ]]; then
        if [[ -d "$child/node_modules" ]]; then
          log_info "Removing ${child#"$ROOT_DIR"/}/node_modules"
          rm -rf "$child/node_modules"
        fi
      fi
    done
  done
  if [[ -f "$ROOT_DIR/bun.lock" ]]; then
    log_info "Removing bun.lock"
    rm -f "$ROOT_DIR/bun.lock"
  fi
  (
    cd "$ROOT_DIR"
    bun install
  )
  log_success "Package updates completed"
}

cmd_update_packages
