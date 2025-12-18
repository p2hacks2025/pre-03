---
allowed-tools: Bash(gh pr view:*), Bash(git worktree:*), Bash(cp:*), Bash(mkdir:*), Bash(fd:*), Bash(direnv:*), Bash(pnpm install), Bash(code:*)
argument-hint: [pr-number]
description: PRレビュー用のworktreeを作成して環境構築を行う
model: sonnet
---

PR #$1 のレビュー用worktreeを作成してください。

## 手順

1. **PR情報を取得**
   gh pr view $1 --json headRefName -q '.headRefName'

2. **リポジトリ情報を取得**
   - リポジトリルート: git rev-parse --show-toplevel
   - リポジトリ名: basename
   - 親ディレクトリ: dirname

3. **worktreeを作成**
   - ブランチ名から # を削除、/ を - に置換
   - パス: ${親ディレクトリ}/${リポジトリ名}--${サニタイズされたブランチ名}
   - git worktree add <path> <branch>

4. **ファイルをコピー**
   - .claude フォルダー全体をコピー（cp -r）
   - .env ファイルをコピー（fd -H -t f '^\.env' で検索してパス構造を維持）

5. **環境構築**
   - direnv allow
   - pnpm install

6. **VSCodeで開く**
   - code -n <worktree_path>

7. **完了報告**
   作成したworktreeのパスと実行した手順を報告
