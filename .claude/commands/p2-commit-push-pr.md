---
allowed-tools: Bash(git checkout --branch:*), Bash(git add:*), Bash(git status:*), Bash(git push:*), Bash(git commit:*), Bash(gh pr create:*), Bash(git branch:*), Bash(git diff:*), Bash(git log:*)
description: コミット、プッシュ、ブランチからPR作成（resolve自動指定）
---

## Context

- Current branch: !`git branch --show-current`
- Current git status: !`git status`
- Uncommitted changes (staged and unstaged): !`git diff HEAD`
- All changes from main: !`git diff main...HEAD`
- Commit history from main: !`git log main..HEAD --oneline`

## Your task

Based on the above changes:

1. Create a new branch if on main
2. If there are uncommitted changes, create a single commit with an appropriate message
3. Push the branch to origin
4. Create a pull request using `gh pr create`
   - **PR title and body must be based on ALL changes from main (commit history + diff)**
   - Summarize the entire branch changes, not just uncommitted changes
5. You have the capability to call multiple tools in a single response. You MUST do all of the above in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.

## Auto Issue Linking

Extract the issue number from the branch name and add `resolve: #<issue number>` to the PR body.

- Branch name format: `<type>/#<issue number>/<description>`
  - Examples: `feat/#123/add-login`, `fix/#456/fix-bug`, `chore/#144/update-ai-review`
- Regex pattern: `/#(\d+)/` to extract issue number
- Add the following to the end of the PR body:
  ```
  resolve: #<extracted issue number>
  ```
- If no issue number is found, do not add the `resolve:` line

### Example

If the branch name is `feat/#123/add-login`, the PR body should be:

```
## Summary
- Add login functionality

## Test plan
- [ ] Verify login works correctly

🤖 Generated with [Claude Code](https://claude.com/claude-code)

resolve: #123
```
