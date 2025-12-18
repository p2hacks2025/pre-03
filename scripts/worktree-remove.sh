#!/bin/bash
# worktree-remove.sh - メインリポジトリ以外のworktreeを選択して削除する
# Usage: ./scripts/worktree-remove.sh

set -e

# Git リポジトリ内かチェック
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "Error: Git リポジトリ内で実行してください"
  exit 1
fi

# メインのworktreeを取得
MAIN_WORKTREE=$(git worktree list | head -n 1 | awk '{print $1}')

# メイン以外のworktreeを取得
OTHER_WORKTREES=$(git worktree list | tail -n +2)

if [[ -z "$OTHER_WORKTREES" ]]; then
  echo "削除可能な worktree がありません"
  exit 0
fi

echo "削除する worktree を選択してください:"
echo ""

# worktreeを配列に格納
WORKTREE_PATHS=()
WORKTREE_BRANCHES=()
INDEX=1
while IFS= read -r line; do
  PATH_FULL=$(echo "$line" | awk '{print $1}')
  BRANCH=$(echo "$line" | awk '{print $3}' | sed 's/^\[//' | sed 's/\]$//')
  # パスを短縮表示
  PATH_SHORT=$(echo "$PATH_FULL" | sed "s|$HOME|~|")

  echo "  ${INDEX}) ${PATH_SHORT}"
  echo "     ブランチ: ${BRANCH}"

  WORKTREE_PATHS+=("$PATH_FULL")
  WORKTREE_BRANCHES+=("$BRANCH")
  ((INDEX++))
done <<< "$OTHER_WORKTREES"

WORKTREE_COUNT=${#WORKTREE_PATHS[@]}

echo ""
echo "  0) キャンセル"
echo ""
read -p "選択 (0-${WORKTREE_COUNT}): " SELECTION

if [[ "$SELECTION" == "0" ]] || [[ -z "$SELECTION" ]]; then
  echo "キャンセルしました"
  exit 0
fi

if [[ ! "$SELECTION" =~ ^[0-9]+$ ]] || [[ "$SELECTION" -lt 1 ]] || [[ "$SELECTION" -gt "$WORKTREE_COUNT" ]]; then
  echo "Error: 無効な選択です"
  exit 1
fi

SELECTED_PATH="${WORKTREE_PATHS[$((SELECTION-1))]}"
SELECTED_BRANCH="${WORKTREE_BRANCHES[$((SELECTION-1))]}"

echo ""
echo "⚠️  以下の worktree を削除します:"
echo "   パス: $SELECTED_PATH"
echo "   ブランチ: $SELECTED_BRANCH"
echo ""
read -p "本当に削除しますか？ [y/N]: " CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "キャンセルしました"
  exit 0
fi

echo ""
echo "🗑️  Worktree を削除中..."

if git worktree remove --force "$SELECTED_PATH" 2>&1; then
  echo "✓ Worktree を削除しました: $SELECTED_PATH"
else
  echo "Error: Worktree の削除に失敗しました"
  exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "✅ Worktree の削除が完了しました"
echo "═══════════════════════════════════════════════════════════════════"
