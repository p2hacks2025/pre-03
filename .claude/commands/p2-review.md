---
allowed-tools: Task, Bash(gh pr view:*), Bash(gh pr diff:*)
argument-hint: [pr-number]
description: PRをレビューしてGitHubにコメントを投稿
model: haiku
---

PR #$1 をレビューしてください。

## 手順

1. `gh pr diff $1` で差分を確認
2. 以下の判定で適切なエージェントを Task で起動：

**→ `p2-review-agent-max`** を使う場合：
- DBスキーマ変更（packages/db/src/schema）
- 認証・認可ロジックの変更
- 新規APIエンドポイント追加

**→ `p2-review-agent-smart`** を使う場合：
- 上記以外すべて

3. レビュー完了後、結果の要約を報告
