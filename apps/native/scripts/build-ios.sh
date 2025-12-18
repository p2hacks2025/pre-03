#!/bin/bash
set -e

# iOS App Store ビルド自動化スクリプト
# 使用方法: pnpm xcode:build:ios

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_CONFIG="$PROJECT_DIR/build-config.json"
POD_PATH="/opt/homebrew/lib/ruby/gems/3.4.0/bin/pod"

cd "$PROJECT_DIR"

echo "=== iOS Build Script ==="
echo ""

# 1. ビルド番号をインクリメント
echo "[1/5] Incrementing build number..."
if [ ! -f "$BUILD_CONFIG" ]; then
  echo "Error: build-config.json not found"
  exit 1
fi

CURRENT_BUILD=$(cat "$BUILD_CONFIG" | grep -o '"buildNumber": [0-9]*' | grep -o '[0-9]*')
NEW_BUILD=$((CURRENT_BUILD + 1))

# jq がインストールされているか確認
if command -v jq &> /dev/null; then
  jq ".ios.buildNumber = $NEW_BUILD" "$BUILD_CONFIG" > "$BUILD_CONFIG.tmp" && mv "$BUILD_CONFIG.tmp" "$BUILD_CONFIG"
else
  # jq がない場合は sed を使用
  sed -i '' "s/\"buildNumber\": $CURRENT_BUILD/\"buildNumber\": $NEW_BUILD/" "$BUILD_CONFIG"
fi

echo "  Build number: $CURRENT_BUILD -> $NEW_BUILD"

# 2. 古い ios ディレクトリを削除
echo ""
echo "[2/5] Cleaning old ios directory..."
if [ -d "$PROJECT_DIR/ios" ]; then
  rm -rf "$PROJECT_DIR/ios"
  echo "  Removed old ios directory"
else
  echo "  No existing ios directory"
fi

# 3. expo prebuild を実行
echo ""
echo "[3/5] Running expo prebuild..."
npx expo prebuild --platform ios

# 4. pod install を実行
echo ""
echo "[4/5] Running pod install..."
cd "$PROJECT_DIR/ios"

if [ -x "$POD_PATH" ]; then
  "$POD_PATH" install
elif command -v pod &> /dev/null; then
  pod install
else
  echo "Error: CocoaPods not found. Please install CocoaPods first."
  exit 1
fi

# 5. Xcode を開く
echo ""
echo "[5/5] Opening Xcode..."
cd "$PROJECT_DIR"
open ios/noval.xcworkspace

echo ""
echo "=== Build preparation complete! ==="
echo ""
echo "Next steps in Xcode:"
echo "  1. Select your Team in Signing & Capabilities"
echo "  2. Set device to 'Any iOS Device (arm64)'"
echo "  3. Product -> Archive"
echo "  4. Distribute App -> App Store Connect -> Upload"
echo ""
echo "Build number: $NEW_BUILD"
