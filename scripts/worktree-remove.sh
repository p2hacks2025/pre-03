#!/bin/bash
# worktree-remove.sh - メインリポジトリ以外のworktreeを選択して削除する
# Usage: ./scripts/worktree-remove.sh

set -e

# 矢印キー選択UI
# 引数: 選択肢の配列
# 戻り値: 選択されたインデックス（0始まり）、キャンセル時は255
select_with_arrows() {
  local options=("$@")
  local count=${#options[@]}
  local selected=0
  local key

  # カーソルを非表示
  tput civis
  # 終了時にカーソルを復元
  trap 'tput cnorm' EXIT

  # 初回表示
  for i in "${!options[@]}"; do
    if [[ $i -eq $selected ]]; then
      echo -e "\033[7m❯ ${options[$i]}\033[0m"
    else
      echo "  ${options[$i]}"
    fi
  done
  echo "  キャンセル"

  while true; do
    # キー入力を読み取り
    IFS= read -rsn1 key

    if [[ $key == $'\x1b' ]]; then
      # エスケープシーケンス（矢印キー等）
      read -rsn2 key
      case $key in
        '[A') # 上矢印
          if ((selected > 0)); then
            ((selected--))
          else
            selected=$count  # キャンセルへループ
          fi
          ;;
        '[B') # 下矢印
          if ((selected < count)); then
            ((selected++))
          else
            selected=0  # 先頭へループ
          fi
          ;;
      esac
    elif [[ $key == '' ]]; then
      # Enter キー
      tput cnorm
      trap - EXIT
      if ((selected == count)); then
        return 255  # キャンセル
      fi
      return $selected
    elif [[ $key == 'q' ]] || [[ $key == 'Q' ]]; then
      # q でキャンセル
      tput cnorm
      trap - EXIT
      return 255
    fi

    # カーソルを上に戻して再描画
    tput cuu $((count + 1))
    for i in "${!options[@]}"; do
      tput el  # 行をクリア
      if [[ $i -eq $selected ]]; then
        echo -e "\033[7m❯ ${options[$i]}\033[0m"
      else
        echo "  ${options[$i]}"
      fi
    done
    tput el
    if ((selected == count)); then
      echo -e "\033[7m❯ キャンセル\033[0m"
    else
      echo "  キャンセル"
    fi
  done
}

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

echo "削除する worktree を選択してください (↑↓で選択, Enterで確定, qでキャンセル):"
echo ""

# worktreeを配列に格納
WORKTREE_PATHS=()
WORKTREE_BRANCHES=()
DISPLAY_OPTIONS=()
while IFS= read -r line; do
  PATH_FULL=$(echo "$line" | awk '{print $1}')
  BRANCH=$(echo "$line" | awk '{print $3}' | sed 's/^\[//' | sed 's/\]$//')
  # パスを短縮表示
  PATH_SHORT=$(echo "$PATH_FULL" | sed "s|$HOME|~|")

  WORKTREE_PATHS+=("$PATH_FULL")
  WORKTREE_BRANCHES+=("$BRANCH")
  DISPLAY_OPTIONS+=("${PATH_SHORT} [${BRANCH}]")
done <<< "$OTHER_WORKTREES"

# 矢印キーで選択
select_with_arrows "${DISPLAY_OPTIONS[@]}"
SELECTION=$?

if [[ $SELECTION -eq 255 ]]; then
  echo ""
  echo "キャンセルしました"
  exit 0
fi

SELECTED_PATH="${WORKTREE_PATHS[$SELECTION]}"
SELECTED_BRANCH="${WORKTREE_BRANCHES[$SELECTION]}"

echo ""
echo "⚠️  以下の worktree を削除します:"
echo "   パス: $SELECTED_PATH"
echo "   ブランチ: $SELECTED_BRANCH"
echo ""
read -p "本当に削除しますか？ [Y/n]: " CONFIRM

if [[ -n "$CONFIRM" && ! "$CONFIRM" =~ ^[Yy]$ ]]; then
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
echo "✅ Worktree の削除が完了しました"
