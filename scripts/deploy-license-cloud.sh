#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_DIR}"
npm run lint
npm run build
npm --prefix functions run build
firebase deploy --only firestore:rules,firestore:indexes,functions:licensing
