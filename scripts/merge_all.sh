#!/bin/bash
set -e
export GIT_AUTHOR_NAME="JuanVictorFY"
export GIT_AUTHOR_EMAIL="figyuptonj99@gmail.com"
export GIT_COMMITTER_NAME="JuanVictorFY"
export GIT_COMMITTER_EMAIL="figyuptonj99@gmail.com"

BRANCHES=(
  "feature/error-handling"
  "feature/memory-system"
  "feature/voice-recognition"
  "feature/notifications"
  "feature/plugin-system"
  "feature/conversation-history"
  "feature/enhanced-tools"
  "feature/ai-providers"
  "feature/keyboard-shortcuts"
  "feature/ui-improvements"
  "experimental/multimodal"
  "hotfix/security-patches"
  "release/v1.0"
  "staging"
  "develop"
)

git checkout main

for branch in "${BRANCHES[@]}"; do
  echo "==> Merging $branch into main..."
  git merge --no-ff --no-edit -m "Merge branch '$branch' into main" "$branch" || {
    echo "Conflict on $branch — using ours for conflicting files"
    git checkout --ours .
    git add -A
    git -c user.name="JuanVictorFY" -c user.email="figyuptonj99@gmail.com" commit -m "Merge branch '$branch' into main (resolved conflicts)"
  }
done

echo ""
echo "=== Total commits on main ==="
git log --oneline | wc -l
