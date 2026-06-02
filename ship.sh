#!/bin/bash
# One-time GitHub login, then push to arkaysite
set -euo pipefail
cd "$(dirname "$0")"

GH="${GH:-}"
if [ -z "$GH" ]; then
  if command -v gh >/dev/null 2>&1; then
    GH=gh
  elif [ -x "../succession-plan-site/.tools/gh_2.93.0_macOS_arm64/bin/gh" ]; then
    GH="../succession-plan-site/.tools/gh_2.93.0_macOS_arm64/bin/gh"
  fi
fi

if [ -z "$GH" ]; then
  echo "Install GitHub CLI: brew install gh"
  echo "Or push with: GITHUB_TOKEN=ghp_xxx node deploy-to-github.mjs"
  exit 1
fi

git remote set-url origin https://github.com/gracemariano/arkaysite.git

if ! "$GH" auth status >/dev/null 2>&1; then
  echo "Opening GitHub login (run this alone — do not paste into git password prompt):"
  "$GH" auth login -h github.com -p https -s repo
fi

"$GH" auth setup-git
git push -u origin main

echo ""
echo "Done. Enable Pages: https://github.com/gracemariano/arkaysite/settings/pages"
echo "Site: https://gracemariano.github.io/arkaysite/"
