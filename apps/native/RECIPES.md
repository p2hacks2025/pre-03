# Native 実装レシピ集 (RECIPES.md)

## このファイルでわかること

具体的なコード例付きの実装パターン集。
基本的な流れは [README.md](./README.md) を参照。

> 最初から全部読む必要はありません。<br />
> 必要になったパターンだけ、その都度ここを見に来てください。

---

## 画面の追加

「ヘルスチェック画面」を例に説明します。

### Step 1: 画面コンポーネントの作成

`src/screens/{screen}/{screen}-screen.tsx` に画面コンポーネントを作成します。

**1-1. 基本的な画面構造** (`src/screens/health/health-screen.tsx`)

```tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button, Card, Spinner } from "heroui-native";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

// withUniwind でスタイリング可能にする
const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledScrollView = withUniwind(ScrollView);

export const HealthScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <StyledScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 16,
      }}
    >
      <StyledView className="mb-6 items-center">
        <StyledText className="font-semibold text-foreground text-lg">
          ヘルスチェック
        </StyledText>
      </StyledView>

      <Card className="mb-6">
        <Card.Body>
          {/* コンテンツ */}
        </Card.Body>
      </Card>

      <Button variant="ghost" onPress={() => router.back()}>
        <Button.Label>戻る</Button.Label>
      </Button>
    </StyledScrollView>
  );
};
```

---

### Step 2: ルートファイルの作成

`app/` 配下にルートファイルを作成し、Screen を re-export します。

**2-1. ルートファイル** (`app/(app)/health.tsx`)

```tsx
import { HealthScreen } from "@/screens/health/health-screen";

export default HealthScreen;
```

**ポイント**:
- `app/` にはルーティング定義のみ配置
- 画面の実装は `src/screens/` に分離
- `default export` で Screen を re-export

---

### Step 3: レイアウトへの登録（必要な場合）

グループレイアウトに画面オプションを追加します。

**3-1. レイアウトファイル** (`app/(app)/_layout.tsx`)

```tsx
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="health"
        options={{ headerShown: false, title: "システム状態" }}
      />
      {/* 他の画面... */}
    </Stack>
  );
}
```

---

## モーダルの追加

Bottom Sheet を使ったモーダルを例に説明します。

### Step 1: モーダルコンポーネントの作成

`src/modals/` にモーダルコンポーネントを作成します。

**1-1. Bottom Sheet モーダル** (`src/modals/confirm-modal.tsx`)

```tsx
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Button } from "heroui-native";
import { forwardRef, useCallback, useMemo } from "react";
import { Text, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = forwardRef<BottomSheet, ConfirmModalProps>(
  ({ title, message, onConfirm, onCancel }, ref) => {
    const snapPoints = useMemo(() => ["25%", "50%"], []);

    const handleSheetChanges = useCallback((index: number) => {
      if (index === -1) {
        onCancel();
      }
    }, [onCancel]);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
      >
        <BottomSheetView>
          <StyledView className="p-4">
            <StyledText className="mb-2 font-bold text-foreground text-lg">
              {title}
            </StyledText>
            <StyledText className="mb-4 text-muted">
              {message}
            </StyledText>
            <StyledView className="flex-row gap-3">
              <Button variant="secondary" onPress={onCancel} className="flex-1">
                <Button.Label>キャンセル</Button.Label>
              </Button>
              <Button variant="primary" onPress={onConfirm} className="flex-1">
                <Button.Label>確認</Button.Label>
              </Button>
            </StyledView>
          </StyledView>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);
```

---

### Step 2: モーダルの使用

**2-1. 親コンポーネントでの使用**

```tsx
import BottomSheet from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { ConfirmModal } from "@/modals/confirm-modal";

export const SomeScreen = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const openModal = () => {
    bottomSheetRef.current?.expand();
  };

  const closeModal = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <>
      {/* 画面コンテンツ */}
      <Button onPress={openModal}>
        <Button.Label>モーダルを開く</Button.Label>
      </Button>

      <ConfirmModal
        ref={bottomSheetRef}
        title="確認"
        message="この操作を実行しますか？"
        onConfirm={() => {
          // 処理実行
          closeModal();
        }}
        onCancel={closeModal}
      />
    </>
  );
};
```

**ポイント**:
- `@gorhom/bottom-sheet` を使用
- `forwardRef` で ref を公開
- `enablePanDownToClose` でスワイプで閉じる

---

## 機能の追加

「ヘルスチェック機能」を例に説明します。

### Step 1: Feature ディレクトリの作成

`src/features/{feature}/` に以下の構造を作成します。

```
src/features/health/
├── components/
│   ├── status-item.tsx
│   ├── status-icon.tsx
│   └── index.ts
├── hooks/
│   └── use-health-check.ts
├── types.ts
└── index.ts
```

---

### Step 2: 型定義

**2-1. 型定義ファイル** (`src/features/health/types.ts`)

```tsx
export interface HealthResult {
  ok: boolean;
  message: string;
  environment?: string;
}

export interface HealthCheckState {
  api: HealthResult | null;
  db: HealthResult | null;
  isLoading: boolean;
  error: string | null;
  allOk: boolean;
}
```

---

### Step 3: カスタムフック

**3-1. データフェッチフック** (`src/features/health/hooks/use-health-check.ts`)

```tsx
import { useCallback, useEffect, useState } from "react";
import { client } from "@/lib/api";
import type { HealthCheckState, HealthResult } from "../types";

const checkApiHealth = async (): Promise<HealthResult> => {
  try {
    const res = await client.health.$get();
    if (res.ok) {
      const data = await res.json();
      return { ok: true, message: "Operational", environment: data.environment };
    }
    return { ok: false, message: `HTTP ${res.status}` };
  } catch {
    return { ok: false, message: "Connection failed" };
  }
};

export const useHealthCheck = () => {
  const [state, setState] = useState<HealthCheckState>({
    api: null,
    db: null,
    isLoading: true,
    error: null,
    allOk: false,
  });

  const runHealthCheck = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [api, db] = await Promise.all([
        checkApiHealth(),
        checkDbHealth(),
      ]);

      setState({
        api,
        db,
        isLoading: false,
        error: null,
        allOk: api.ok && db.ok,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to check health status",
      }));
    }
  }, []);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  return { ...state, refresh: runHealthCheck };
};
```

---

### Step 4: コンポーネント

**4-1. UI コンポーネント** (`src/features/health/components/status-item.tsx`)

```tsx
import { Ionicons } from "@expo/vector-icons";
import { Chip } from "heroui-native";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledIonicons = withUniwind(Ionicons);

type StatusItemProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
  message: string;
  ok?: boolean;
  badge?: { label: string; color: "success" | "default" | "warning" };
};

export const StatusItem = ({ icon, title, message, ok, badge }: StatusItemProps) => {
  return (
    <StyledView className="flex-row items-center justify-between p-4">
      <StyledView className="flex-row items-center gap-3">
        <StyledIonicons name={icon} size={20} className="text-muted" />
        <StyledView>
          <StyledText className="font-medium text-foreground">{title}</StyledText>
          <StyledText className="text-muted text-sm">{message}</StyledText>
        </StyledView>
      </StyledView>
      {ok !== undefined && (
        <StyledIonicons
          name={ok ? "checkmark-circle" : "close-circle"}
          size={20}
          className={ok ? "text-success" : "text-danger"}
        />
      )}
      {badge && (
        <Chip size="sm" variant="soft" color={badge.color}>
          <Chip.Label>{badge.label}</Chip.Label>
        </Chip>
      )}
    </StyledView>
  );
};
```

---

### Step 5: Barrel Export

**5-1. コンポーネント export** (`src/features/health/components/index.ts`)

```tsx
export { StatusItem } from "./status-item";
export { StatusIcon } from "./status-icon";
```

**5-2. Feature export** (`src/features/health/index.ts`)

```tsx
export * from "./components";
export { useHealthCheck } from "./hooks/use-health-check";
export * from "./types";
```

---

## UIコンポーネントの追加

汎用 UI コンポーネントの追加パターンです。

### Step 1: コンポーネントの作成

`src/components/ui/` に汎用コンポーネントを作成します。

**1-1. 基本的な UI コンポーネント** (`src/components/ui/icon-button.tsx`)

```tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, type PressableProps } from "react-native";
import { withUniwind } from "uniwind";

const StyledPressable = withUniwind(Pressable);
const StyledIonicons = withUniwind(Ionicons);

interface IconButtonProps extends Omit<PressableProps, "children"> {
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  className?: string;
}

export const IconButton = ({
  icon,
  size = 24,
  color,
  className,
  ...props
}: IconButtonProps) => {
  return (
    <StyledPressable
      className={`items-center justify-center rounded-full p-2 active:opacity-70 ${className}`}
      {...props}
    >
      <StyledIonicons
        name={icon}
        size={size}
        className={color ?? "text-foreground"}
      />
    </StyledPressable>
  );
};
```

---

### Step 2: Export

**2-1. Index ファイル** (`src/components/ui/index.ts`)

```tsx
export { IconButton } from "./icon-button";
```

**ポイント**:
- `withUniwind` でスタイリング可能にする
- Props は適切な型を継承
- `className` を受け取れるようにする

---

## フォーム機能の追加

「ログインフォーム」を例に説明します。

### Step 1: フォームコンポーネントの作成

**1-1. フォームコンポーネント** (`src/features/auth/components/login-form.tsx`)

```tsx
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { type LoginInput, LoginInputSchema } from "@packages/schema/auth";
import { Button, Spinner, TextField, useToast } from "heroui-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";
import { useAuth } from "@/contexts/auth-context";

const StyledView = withUniwind(View);
const StyledIonicons = withUniwind(Ionicons);

export const LoginForm = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.show({
        variant: "success",
        label: "ログイン成功",
      });
    } catch (error) {
      toast.show({
        variant: "danger",
        label: "ログイン失敗",
        description: error instanceof Error ? error.message : "エラーが発生しました",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledView className="gap-6">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField isRequired isInvalid={!!errors.email}>
            <TextField.Label>メールアドレス</TextField.Label>
            <TextField.Input
              placeholder="user@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            >
              <TextField.InputStartContent className="pointer-events-none">
                <StyledIonicons name="mail-outline" size={16} className="text-muted" />
              </TextField.InputStartContent>
            </TextField.Input>
            {errors.email && (
              <TextField.ErrorMessage>{errors.email.message}</TextField.ErrorMessage>
            )}
          </TextField>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField isRequired isInvalid={!!errors.password}>
            <TextField.Label>パスワード</TextField.Label>
            <TextField.Input
              placeholder="********"
              secureTextEntry={!isPasswordVisible}
              autoComplete="password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            >
              <TextField.InputStartContent className="pointer-events-none">
                <StyledIonicons name="lock-closed-outline" size={16} className="text-muted" />
              </TextField.InputStartContent>
              <TextField.InputEndContent>
                <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <StyledIonicons
                    name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                    size={16}
                    className="text-muted"
                  />
                </Pressable>
              </TextField.InputEndContent>
            </TextField.Input>
            {errors.password && (
              <TextField.ErrorMessage>{errors.password.message}</TextField.ErrorMessage>
            )}
          </TextField>
        )}
      />

      <Button onPress={handleSubmit(onSubmit)} isDisabled={isSubmitting}>
        {isSubmitting ? <Spinner size="sm" color="white" /> : <Button.Label>ログイン</Button.Label>}
      </Button>
    </StyledView>
  );
};
```

**ポイント**:
- `react-hook-form` + `@hookform/resolvers/zod` でフォーム管理
- `@packages/schema` のスキーマを使用
- HeroUI Native の `TextField` で統一的な UI
- `Controller` でフォームフィールドをラップ

---

## 追加パターン

### 認証付き画面の追加

認証が必要な画面は `(app)` グループに配置します。

**1. グループレイアウトでの認証ガード** (`app/(app)/_layout.tsx`)

```tsx
import { Redirect, Stack } from "expo-router";
import { Spinner } from "heroui-native";
import { View } from "react-native";
import { withUniwind } from "uniwind";
import { useAuth } from "@/contexts/auth-context";

const StyledView = withUniwind(View);

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // ローディング中
  if (isLoading) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-background">
        <Spinner size="lg" />
      </StyledView>
    );
  }

  // 未認証ならログイン画面へリダイレクト
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* 他の認証付き画面... */}
    </Stack>
  );
}
```

**ポイント**:
- `(app)` グループ = 認証必須
- `(auth)` グループ = 認証不要（ログイン/サインアップ）
- `_layout.tsx` で認証チェック + リダイレクト

---

### API 呼び出し

**1. 認証不要の API 呼び出し**

```tsx
import { client } from "@/lib/api";

const fetchHealth = async () => {
  const res = await client.health.$get();
  if (res.ok) {
    return await res.json();
  }
  throw new Error(`HTTP ${res.status}`);
};
```

**2. 認証付き API 呼び出し**

```tsx
import { createAuthenticatedClient } from "@/lib/api";

const fetchUserData = async (accessToken: string) => {
  const authClient = createAuthenticatedClient(accessToken);
  const res = await authClient.user.me.$get();
  if (res.ok) {
    return await res.json();
  }
  throw new Error(`HTTP ${res.status}`);
};
```

**3. AuthContext 経由での使用**

```tsx
import { useAuth } from "@/contexts/auth-context";
import { createAuthenticatedClient } from "@/lib/api";

const SomeComponent = () => {
  const { accessToken } = useAuth();

  const handleFetch = async () => {
    if (!accessToken) return;

    const authClient = createAuthenticatedClient(accessToken);
    const res = await authClient.user.profile.$get();
    // ...
  };

  return <Button onPress={handleFetch}>...</Button>;
};
```

**クライアントの使い分け**:

| クライアント | 用途 | 認証 |
|-------------|------|------|
| `client` | 公開エンドポイント（ヘルスチェック等） | なし |
| `createAuthenticatedClient(token)` | 認証必須エンドポイント | Bearer トークン |

---

### フォームバリデーションの拡張

`@packages/schema` のスキーマを拡張して、フォーム固有のバリデーションを追加します。

**1. スキーマの拡張** (`src/features/auth/lib/validations.ts`)

```tsx
import { SignupInputSchema } from "@packages/schema/auth";
import { z } from "zod";

export const signupFormSchema = SignupInputSchema.extend({
  confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  },
);

export type SignupFormValues = z.infer<typeof signupFormSchema>;
```

**2. フォームでの使用**

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupFormSchema, type SignupFormValues } from "../lib/validations";

const {
  control,
  handleSubmit,
  formState: { errors },
} = useForm<SignupFormValues>({
  resolver: zodResolver(signupFormSchema),
  defaultValues: {
    email: "",
    password: "",
    displayName: "",
    confirmPassword: "",
  },
});
```

**ポイント**:
- `.extend()` で新しいフィールドを追加
- `.refine()` で複数フィールドにまたがるバリデーション
- `path` でエラーを表示するフィールドを指定
