---
allowed-tools: Task, Bash(gh pr diff:*)
description: PRをレビューしてGitHubにコメントを投稿
model: haiku
---

現在のブランチの差分をレビューしてください。

## 手順

1. `gh pr diff` で差分を確認（PRがなければ `git diff main...HEAD`）

2. 以下の判定で適切なエージェントを Task で起動：

**→ `p2-review-agent-max`** を使う場合：
- DBスキーマ変更（packages/db/src/schema）
- 認証・認可ロジックの変更
- 500行を超えるような大規模な変更

**→ `p2-review-agent-smart`** を使う場合：
- 上記以外すべて

3. レビュー完了後、結果の要約を報告
