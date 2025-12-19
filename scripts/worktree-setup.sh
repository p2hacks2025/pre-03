#!/bin/bash
# worktree-setup.sh - ブランチ名からworktreeを作成して環境構築を行う
# Usage: ./scripts/worktree-setup.sh <branch-name>

set -e

# 引数チェック
if [[ -z "$1" ]]; then
  echo "Error: ブランチ名を指定してください"
  echo "Usage: pnpm branch:setup <branch-name>"
  echo "Example: pnpm branch:setup feature/#45/ai-post"
  exit 1
fi

BRANCH="$1"

# Git リポジトリ内かチェック
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "Error: Git リポジトリ内で実行してください"
  exit 1
fi

echo "🔍 ブランチを確認中: $BRANCH"

# リモートブランチを取得
git fetch origin --prune

# ブランチの存在確認
if ! git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
  echo "Error: リモートブランチが見つかりません: origin/$BRANCH"
  exit 1
fi

echo "✓ ブランチを確認しました: $BRANCH"

# リポジトリ情報を取得
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")
REPO_PARENT=$(dirname "$REPO_ROOT")

# ブランチ名をサニタイズ（# を削除、/ を - に置換）
SANITIZED_BRANCH=$(echo "$BRANCH" | sed 's/#//g; s/\//-/g')

# Worktree パスを構築
WORKTREE_PATH="${REPO_PARENT}/${REPO_NAME}--${SANITIZED_BRANCH}"

# 既存チェック
if [[ -d "$WORKTREE_PATH" ]]; then
  echo "Error: Worktree が既に存在します: $WORKTREE_PATH"
  exit 1
fi

echo ""
echo "📁 Worktree を作成中..."
echo "   パス: $WORKTREE_PATH"
echo "   ブランチ: $BRANCH"

# Worktree を作成
# ローカルブランチが存在するか確認
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  # ローカルブランチが存在する場合はそれを使用
  git worktree add "$WORKTREE_PATH" "$BRANCH"
else
  # ローカルブランチがない場合は、リモートを追跡するローカルブランチを作成
  git worktree add --track -b "$BRANCH" "$WORKTREE_PATH" "origin/$BRANCH"
fi

echo "✓ Worktree を作成しました"

# .claude フォルダをコピー
if [[ -d "$REPO_ROOT/.claude" ]]; then
  echo ""
  echo "📋 .claude フォルダをコピー中..."
  cp -r "$REPO_ROOT/.claude" "$WORKTREE_PATH/.claude"
  echo "✓ .claude フォルダをコピーしました"
fi

# .env ファイルをコピー（パス構造を維持）
echo ""
echo "📋 .env ファイルをコピー中..."
if command -v fd &> /dev/null; then
  ENV_FILES=$(cd "$REPO_ROOT" && fd -H -t f '^\.env' 2>/dev/null || true)
else
  ENV_FILES=$(cd "$REPO_ROOT" && find . -name '.env*' -type f 2>/dev/null || true)
fi
if [[ -n "$ENV_FILES" ]]; then
  while IFS= read -r env_file; do
    DEST_DIR="$WORKTREE_PATH/$(dirname "$env_file")"
    mkdir -p "$DEST_DIR"
    cp "$REPO_ROOT/$env_file" "$WORKTREE_PATH/$env_file"
    echo "   ✓ $env_file"
  done <<< "$ENV_FILES"
else
  echo "   (コピーする .env ファイルはありません)"
fi

# direnv allow
if [[ -f "$WORKTREE_PATH/.envrc" ]]; then
  if command -v direnv &> /dev/null; then
    echo ""
    echo "🔧 direnv allow を実行中..."
    (cd "$WORKTREE_PATH" && direnv allow)
    echo "✓ direnv allow を実行しました"
  else
    echo ""
    echo "⚠️  direnv がインストールされていません。手動で direnv allow を実行してください"
  fi
fi

# pnpm install
echo ""
echo "📦 pnpm install を実行中..."
(cd "$WORKTREE_PATH" && pnpm install)
echo "✓ 依存関係をインストールしました"

# VSCode で開く
echo ""
if command -v code &> /dev/null; then
  echo "🚀 VSCode で開きます..."
  code -n "$WORKTREE_PATH"
else
  echo "💡 VSCode を手動で開いてください: $WORKTREE_PATH"
fi

echo ""
echo "✅ Worktree のセットアップが完了しました！"
echo ""
echo "   パス: $WORKTREE_PATH"
echo "   ブランチ: $BRANCH"
echo ""
echo "作業完了後の削除方法: pnpm branch:remove"
