#!/bin/bash
set -e

# Android ビルド自動化スクリプト
# 使用方法: pnpm android:build
#
# オプション:
#   --apk     APK ファイルをビルド（デフォルト）
#   --aab     AAB ファイルをビルド（Play Store 用）
#   --both    APK と AAB の両方をビルド

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_CONFIG="$PROJECT_DIR/build-config.json"
BUILDS_DIR="$PROJECT_DIR/builds"

# Java 21 を使用（Gradle 互換性のため）
export JAVA_HOME=$(/usr/libexec/java_home -v 21 2>/dev/null || /usr/libexec/java_home -v 17 2>/dev/null)
if [ -z "$JAVA_HOME" ]; then
  echo "Error: Java 17 or 21 is required. Please install one of them."
  echo "  brew install --cask temurin@21"
  exit 1
fi
echo "Using Java: $JAVA_HOME"

cd "$PROJECT_DIR"

# 引数のパース
BUILD_APK=true
BUILD_AAB=false

for arg in "$@"; do
  case $arg in
    --apk)
      BUILD_APK=true
      BUILD_AAB=false
      ;;
    --aab)
      BUILD_APK=false
      BUILD_AAB=true
      ;;
    --both)
      BUILD_APK=true
      BUILD_AAB=true
      ;;
  esac
done

echo "=== Android Build Script ==="
echo ""

# 1. ビルド番号（versionCode）をインクリメント
echo "[1/5] Incrementing versionCode..."
if [ ! -f "$BUILD_CONFIG" ]; then
  echo "Error: build-config.json not found"
  exit 1
fi

CURRENT_VERSION=$(cat "$BUILD_CONFIG" | grep -o '"versionCode": [0-9]*' | grep -o '[0-9]*')
NEW_VERSION=$((CURRENT_VERSION + 1))

# jq がインストールされているか確認
if command -v jq &> /dev/null; then
  jq ".android.versionCode = $NEW_VERSION" "$BUILD_CONFIG" > "$BUILD_CONFIG.tmp" && mv "$BUILD_CONFIG.tmp" "$BUILD_CONFIG"
else
  # jq がない場合は sed を使用
  sed -i '' "s/\"versionCode\": $CURRENT_VERSION/\"versionCode\": $NEW_VERSION/" "$BUILD_CONFIG"
fi

echo "  versionCode: $CURRENT_VERSION -> $NEW_VERSION"

# 2. 古い android ディレクトリを削除
echo ""
echo "[2/5] Cleaning old android directory..."
if [ -d "$PROJECT_DIR/android" ]; then
  rm -rf "$PROJECT_DIR/android"
  echo "  Removed old android directory"
else
  echo "  No existing android directory"
fi

# 3. expo prebuild を実行
echo ""
echo "[3/5] Running expo prebuild..."
npx expo prebuild --platform android

# 4. Gradle でビルド
echo ""
echo "[4/5] Building with Gradle..."
cd "$PROJECT_DIR/android"

if [ "$BUILD_APK" = true ] && [ "$BUILD_AAB" = true ]; then
  echo "  Building both APK and AAB..."
  ./gradlew assembleRelease bundleRelease
elif [ "$BUILD_AAB" = true ]; then
  echo "  Building AAB..."
  ./gradlew bundleRelease
else
  echo "  Building APK..."
  ./gradlew assembleRelease
fi

# 5. ビルド成果物を builds ディレクトリにコピー
echo ""
echo "[5/5] Copying build artifacts..."
cd "$PROJECT_DIR"

# builds ディレクトリを作成
mkdir -p "$BUILDS_DIR"

# タイムスタンプ付きファイル名
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
APP_NAME="noval"

if [ "$BUILD_APK" = true ]; then
  APK_SOURCE="$PROJECT_DIR/android/app/build/outputs/apk/release/app-release.apk"
  if [ -f "$APK_SOURCE" ]; then
    APK_DEST="$BUILDS_DIR/${APP_NAME}_v${NEW_VERSION}_${TIMESTAMP}.apk"
    cp "$APK_SOURCE" "$APK_DEST"
    echo "  APK saved: $APK_DEST"
  else
    echo "  Warning: APK file not found at $APK_SOURCE"
  fi
fi

if [ "$BUILD_AAB" = true ]; then
  AAB_SOURCE="$PROJECT_DIR/android/app/build/outputs/bundle/release/app-release.aab"
  if [ -f "$AAB_SOURCE" ]; then
    AAB_DEST="$BUILDS_DIR/${APP_NAME}_v${NEW_VERSION}_${TIMESTAMP}.aab"
    cp "$AAB_SOURCE" "$AAB_DEST"
    echo "  AAB saved: $AAB_DEST"
  else
    echo "  Warning: AAB file not found at $AAB_SOURCE"
  fi
fi

echo ""
echo "=== Build complete! ==="
echo ""
echo "versionCode: $NEW_VERSION"
echo ""
echo "Build artifacts saved in: $BUILDS_DIR"
if [ "$BUILD_APK" = true ]; then
  echo "  - APK: ${APP_NAME}_v${NEW_VERSION}_${TIMESTAMP}.apk"
fi
if [ "$BUILD_AAB" = true ]; then
  echo "  - AAB: ${APP_NAME}_v${NEW_VERSION}_${TIMESTAMP}.aab"
fi
echo ""
echo "To install APK on connected device:"
echo "  adb install $BUILDS_DIR/${APP_NAME}_v${NEW_VERSION}_${TIMESTAMP}.apk"
echo ""
