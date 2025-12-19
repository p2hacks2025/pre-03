---
allowed-tools: Task, Bash(gh pr diff:*)
description: PRをレビューしGitHubにコメント投稿
model: haiku
---

Review the diff of the current branch.

## Steps

1. Check the diff with `gh pr diff` (if no PR exists, use `git diff main...HEAD`)

2. Launch the appropriate agent using Task based on the following criteria:

**Use `p2-review-agent-max`** when:
- DB schema changes (packages/db/src/schema)
- Authentication/authorization logic changes
- Large-scale changes exceeding 500 lines

**Use `p2-review-agent-smart`** when:
- All other cases

3. After the review is complete, report a summary of the results
