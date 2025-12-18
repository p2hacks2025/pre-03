---
allowed-tools: Bash(git fetch:*), Bash(git branch:*), Bash(git rev-parse:*), Bash(git worktree:*), Bash(cp:*), Bash(mkdir:*), Bash(fd:*), Bash(direnv:*), Bash(pnpm install), Bash(code:*), Bash(basename:*), Bash(dirname:*), Bash(echo:*)
argument-hint: [issue-number]
description: issue番号からworktreeを作成して環境構築を行う
model: sonnet
---

Issue #$1 に関連するブランチの worktree を作成してください。

## ブランチ命名規則

ブランチは `prefix/#issue-number/説明` の形式で命名されています（例: `feature/#123/add-login-form`）。

## 手順

1. **リモートブランチを検索**

   - git fetch origin
   - git branch -r でリモートブランチ一覧を取得
   - `#$1/` を含むブランチを検索（例: `#123/` にマッチするブランチ）
   - 複数見つかった場合はユーザーに選択を求める
   - 見つからない場合はエラーを報告して終了

2. **リポジトリ情報を取得**

   - リポジトリルート: git rev-parse --show-toplevel
   - リポジトリ名: basename
   - 親ディレクトリ: dirname

3. **worktree を作成**

   - ブランチ名から # を削除、/ を - に置換
   - パス: ${親ディレクトリ}/${リポジトリ名}--${サニタイズされたブランチ名}
   - git worktree add <path> <branch>

4. **ファイルをコピー**

   - .claude フォルダー全体をコピー（cp -r）
   - .env ファイルをコピー（fd -H -t f '^\.env' で検索してパス構造を維持）

5. **環境構築**

   - direnv allow
   - pnpm install

6. **VSCode で開く**

   - code -n <worktree_path>

7. **完了報告と次のステップ**
   作成した worktree のパスと実行した手順を報告し、以下を案内：
   - 作業完了後は `git worktree remove <path>` で worktree を削除
   - または `/commit-commands:clean_gone` コマンドで一括削除
