# apps/native → apps/web 機能移植計画

## 概要

apps/native（React Native）の機能をapps/web（Next.js 15）にPC向けに移植する。

### 方針
- **レイアウト**: PC最適化（サイドバー型）- 左ナビ、中央コンテンツ
- **UIライブラリ**: HeroUI（既存）
- **優先順位**: ホーム（タイムライン）から開始

---

## Phase 1: 基盤構築（サイドバーレイアウト + ホーム画面）

### 1.1 PC向けレイアウト

**新規作成ファイル:**
- [ ] `src/app/(app)/layout.tsx` - 認証必須レイアウト + サイドバー
- [ ] `src/app/(app)/_components/sidebar.tsx` - 左サイドバー
- [ ] `src/app/(app)/_components/sidebar-item.tsx` - ナビアイテム

**レイアウト構成:**
```
┌─────────────────────────────────────────────────┐
│ Sidebar (240px) │  Main Content (flex-1)       │
│                 │                               │
│ ・ホーム        │                               │
│ ・カレンダー    │                               │
│ ・プロフィール  │                               │
│                 │                               │
│ [日記を書く]    │                               │
└─────────────────────────────────────────────────┘
```

### 1.2 タイムライン機能

**新規作成ファイル:**
- [ ] `src/features/timeline/index.ts`
- [ ] `src/features/timeline/hooks/use-timeline.ts`
- [ ] `src/features/timeline/components/timeline.tsx`
- [ ] `src/features/timeline/components/ai-timeline-item.tsx`
- [ ] `src/features/timeline/components/user-timeline-item.tsx`
- [ ] `src/features/timeline/lib/format-time.ts`

**移植元:**
- `apps/native/src/features/timeline/hooks/use-timeline.ts`
- `apps/native/src/features/timeline/components/timeline.tsx`
- `apps/native/src/features/timeline/components/ai-timeline-item.tsx`
- `apps/native/src/features/timeline/components/user-timeline-item.tsx`

**変更点:**
- `createAuthenticatedClient(token)` → `client`（Cookie認証）
- `FlatList` → `div` + `IntersectionObserver`（無限スクロール）
- `withUniwind(View)` → 通常の`className`
- `useFocusEffect` → `useEffect`

### 1.3 ホーム画面

**新規作成ファイル:**
- [ ] `src/app/(app)/page.tsx`

**実装内容:**
- タイムライン表示
- 無限スクロール（IntersectionObserver）
- リフレッシュボタン
- ローディング/エラー状態

---

## Phase 2: カレンダー・週詳細 ✅

### 2.1 カレンダー機能

**新規作成ファイル:**
- [x] `src/features/calendar/index.ts`
- [x] `src/features/calendar/hooks/use-calendar.ts`
- [x] `src/features/calendar/components/calendar.tsx`
- [x] `src/features/calendar/components/week-row.tsx`
- [x] `src/features/calendar/lib/date-utils.ts`
- [x] `src/features/calendar/types.ts`

**移植元:**
- `apps/native/src/features/calendar/`

**備考:**
- `sticky-header.tsx` は PC向けでは不要と判断し、スキップ

### 2.2 カレンダー画面

**新規作成ファイル:**
- [x] `src/app/(app)/calendar/page.tsx`

### 2.3 週詳細機能

**新規作成ファイル:**
- [x] `src/features/reflection/index.ts`
- [x] `src/features/reflection/hooks/use-weekly-world.ts`
- [x] `src/features/reflection/hooks/use-week-navigation.ts`
- [x] `src/features/reflection/components/world-viewer.tsx`
- [x] `src/features/reflection/components/detail-tabs.tsx`
- [x] `src/features/reflection/components/detail-diary.tsx`
- [x] `src/features/reflection/components/detail-timeline.tsx`
- [x] `src/features/reflection/types.ts`

**移植元:**
- `apps/native/src/features/reflection/`

### 2.4 週詳細画面

**新規作成ファイル:**
- [x] `src/app/(app)/reflection/[week]/page.tsx`

---

## Phase 3: プロフィール・日記作成

### 3.1 プロフィール機能

**新規作成ファイル:**
- [ ] `src/features/profile/index.ts`
- [ ] `src/features/profile/hooks/use-profile-entries.ts`
- [ ] `src/features/profile/hooks/use-profile-stats.ts`
- [ ] `src/features/profile/components/profile-header.tsx`
- [ ] `src/features/profile/components/entry-list.tsx`

**移植元:**
- `apps/native/src/features/profile/`

### 3.2 プロフィール画面

**新規作成ファイル:**
- [ ] `src/app/(app)/profile/page.tsx`

**既存活用:**
- `src/app/dashboard/_components/avatar-upload.tsx` を参考

### 3.3 日記作成機能

**新規作成ファイル:**
- [ ] `src/features/diary/index.ts`
- [ ] `src/features/diary/hooks/use-diary-submit.ts`
- [ ] `src/features/diary/components/image-upload.tsx`
- [ ] `src/features/diary/components/diary-form.tsx`

**移植元:**
- `apps/native/src/features/diary/`
- `apps/native/src/screens/diary/diary-input-screen.tsx`

### 3.4 日記作成画面（モーダル）

**新規作成ファイル:**
- [ ] `src/app/(app)/diary/new/page.tsx`

**PC向け最適化:**
- ドラッグ&ドロップ対応
- キーボードショートカット（Ctrl+Enter）

---

## Phase 4: ポップアップ・仕上げ

### 4.1 ポップアップ機能

**新規作成ファイル:**
- [ ] `src/contexts/popup-context.tsx`
- [ ] `src/features/popup/index.ts`
- [ ] `src/features/popup/hooks/use-daily-popup.ts`
- [ ] `src/features/popup/components/popup-overlay.tsx`
- [ ] `src/features/popup/components/popup-card.tsx`
- [ ] `src/features/popup/lib/popup-storage.ts`

**移植元:**
- `apps/native/src/contexts/popup-context.tsx`
- `apps/native/src/features/popup/`

**変更点:**
- `AsyncStorage` → `localStorage`

---

## 技術的考慮事項

### API通信
- Web版は Cookie 認証（`credentials: 'include'`）
- `client` を使用（`createAuthenticatedClient` 不要）
- multipart は既存の `postMultipart` を使用

### スタイリング
- Tailwind CSS 4
- HeroUI コンポーネント（Button, Card, Avatar, Tabs, Modal等）
- nativeの色定義を維持（#C4A574, #4ECCDD等）

### 無限スクロール
```tsx
// IntersectionObserver パターン
const observerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
        fetchMore();
      }
    },
    { threshold: 0.5 }
  );
  if (observerRef.current) observer.observe(observerRef.current);
  return () => observer.disconnect();
}, [hasMore, isFetchingMore, fetchMore]);
```

---

## 重要な参照ファイル

| 用途                | ファイルパス                                                             |
| ------------------- | ------------------------------------------------------------------------ |
| タイムラインhook    | `apps/native/src/features/timeline/hooks/use-timeline.ts`                |
| タイムラインUI      | `apps/native/src/features/timeline/components/`                          |
| カレンダーhook      | `apps/native/src/features/calendar/hooks/use-calendar.ts`                |
| 週間世界hook        | `apps/native/src/features/reflection/hooks/use-weekly-world-prefetch.ts` |
| ポップアップcontext | `apps/native/src/contexts/popup-context.tsx`                             |
| Web APIクライアント | `apps/web/src/lib/api.ts`                                                |
| Web認証context      | `apps/web/src/contexts/auth-context.tsx`                                 |

---

## 実装順序まとめ

1. **Phase 1**: サイドバーレイアウト → タイムライン機能 → ホーム画面
2. **Phase 2**: カレンダー機能 → カレンダー画面 → 週詳細機能 → 週詳細画面
3. **Phase 3**: プロフィール機能 → プロフィール画面 → 日記機能 → 日記画面
4. **Phase 4**: ポップアップ機能 → 全体調整
