#!/bin/bash
# Claude Code Stop hook - runs check:fix and typecheck before finishing

cd "$CLAUDE_PROJECT_DIR" || exit 0

echo "=== Final quality check ===" >&2

# Biome auto-fix
check_output=$(pnpm check:fix 2>&1) || {
  echo "Biome errors:" >&2
  echo "$check_output" >&2
}

# TypeScript type check
type_output=$(pnpm typecheck 2>&1) || {
  echo "TypeScript errors:" >&2
  echo "$type_output" >&2
  cat <<EOF
{
  "decision": "block",
  "reason": "TypeScript errors found. Please fix them before finishing."
}
EOF
  exit 0
}

echo "All checks passed ✅" >&2
exit 0
