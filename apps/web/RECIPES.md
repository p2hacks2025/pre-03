# Web 実装レシピ集 (RECIPES.md)

## このファイルでわかること

具体的なコード例付きの実装パターン集。
基本的な流れは [README.md](./README.md) を参照。

> 最初から全部読む必要はありません。<br />
> 必要になったパターンだけ、その都度ここを見に来てください。

---

## ページの追加

「設定ページ」を例に説明します。

### Step 1: ページファイルの作成

`app/settings/page.tsx` を作成します。

**1-1. 基本的なページ構造**

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SettingsForm } from "./_components/settings-form";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">設定</CardTitle>
          <CardDescription>アカウント設定を変更</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Step 2: ローカルコンポーネントの作成

ページ固有のコンポーネントは `_components/` に配置します。

**2-1. フォームコンポーネント** (`app/settings/_components/settings-form.tsx`)

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// ローカルでスキーマを定義（または _lib/validations.ts に切り出し）
const settingsSchema = z.object({
  displayName: z.string().min(1, "表示名を入力してください"),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export const SettingsForm = () => {
  const [error, setError] = useState("");

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      displayName: "",
    },
  });

  const onSubmit = async (values: SettingsFormValues) => {
    setError("");
    try {
      // API 呼び出し
      console.log(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>表示名</FormLabel>
              <FormControl>
                <Input placeholder="山田太郎" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "保存中..." : "保存"}
        </Button>
      </form>
    </Form>
  );
};
```

---

### Step 3: フォームバリデーションの切り出し（必要な場合）

複雑なバリデーションや複数フォームで共有する場合は `_lib/` に切り出します。

**3-1. バリデーションファイル** (`app/settings/_lib/validations.ts`)

```tsx
import { z } from "zod";

export const settingsSchema = z.object({
  displayName: z.string().min(1, "表示名を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
```

**3-2. @packages/schema を拡張するパターン**

```tsx
import { UpdateProfileInputSchema } from "@packages/schema/user";
import { z } from "zod";

// バックエンドスキーマを拡張
export const settingsFormSchema = UpdateProfileInputSchema.extend({
  confirmEmail: z.string().email(),
}).refine((data) => data.email === data.confirmEmail, {
  message: "メールアドレスが一致しません",
  path: ["confirmEmail"],
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
```

---

## 認証付きページの追加

「マイページ」を例に説明します。

### Step 1: ページコンポーネントで認証チェック

`"use client"` + `useAuth` + `useRouter` でリダイレクト処理を実装します。

**1-1. 認証付きページの基本構造** (`app/my-page/page.tsx`)

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

import { MyPageContent } from "./_components/my-page-content";

export default function MyPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // 未ログインの場合はホームページにリダイレクト
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  // ローディング中
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // 未ログインの場合はリダイレクト中の表示
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  // 認証済みの場合はコンテンツを表示
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <MyPageContent />
    </div>
  );
}
```

---

### Step 2: API 呼び出し

認証が必要な API を呼び出す場合は `client`（credentials: include）を使用します。

```tsx
import { client } from "@/lib/api";

// Cookie 認証で API を呼び出し
const res = await client.user.me.$get();
if (res.ok) {
  const data = await res.json();
  // ...
}
```

**クライアントの使い分け**:

| クライアント | 用途 | 認証 |
|-------------|------|------|
| `publicClient` | 認証不要エンドポイント（ヘルスチェック等） | なし |
| `client` | Cookie 認証が必要なエンドポイント | HttpOnly Cookie |
| `createServerClient()` | Server Component での API 呼び出し | Cookie → Authorization ヘッダー |

---

## ファイルアップロード

「アバターアップロード」を例に説明します。

### Step 1: アップロード UI コンポーネントの作成

ファイル選択 UI を `_components/` に作成します。

**1-1. アップロードコンポーネント** (`app/dashboard/_components/avatar-upload.tsx`)

```tsx
"use client";

import { useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  displayName: string | null;
  isUploading: boolean;
  onFileSelect: (file: File) => void;
}

export const AvatarUpload = ({
  currentAvatarUrl,
  displayName,
  isUploading,
  onFileSelect,
}: AvatarUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!isUploading) {
      inputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = ""; // 同じファイルを再選択可能に
    }
  };

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isUploading}
        className="relative cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed"
      >
        <Avatar className="size-20">
          <AvatarImage src={currentAvatarUrl ?? undefined} alt="Avatar" />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white text-xs transition-opacity",
            isUploading
              ? "opacity-100"
              : isHovered
                ? "opacity-100"
                : "opacity-0",
          )}
        >
          {isUploading ? <LoadingSpinner /> : "Edit"}
        </div>
      </button>
    </div>
  );
};
```

---

### Step 2: 親コンポーネントでの状態管理と API 呼び出し

`postMultipart` ヘルパーを使用して multipart/form-data を送信します。

**2-1. 親コンポーネントでの使用** (`app/dashboard/_components/user-info.tsx`)

```tsx
"use client";

import { useState } from "react";
import { postMultipart } from "@packages/api-contract";

import { useAuth } from "@/contexts/auth-context";
import { client } from "@/lib/api";

import { AvatarUpload } from "./avatar-upload";

import type { UploadAvatarOutput } from "@packages/schema/user";

export const UserInfo = () => {
  const { user, profile, updateProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    setError(null);

    try {
      // FormData を作成
      const formData = new FormData();
      formData.append("file", file);

      // postMultipart で multipart/form-data を送信
      const result = await postMultipart<UploadAvatarOutput>(
        client.user.avatar,  // エンドポイント
        formData,            // FormData
      );

      // ローカル状態を更新
      updateProfile({ avatarUrl: result.avatarUrl });
    } catch (e) {
      setError(e instanceof Error ? e.message : "アップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AvatarUpload
      currentAvatarUrl={profile?.avatarUrl ?? null}
      displayName={profile?.displayName ?? null}
      isUploading={isUploading}
      onFileSelect={handleFileSelect}
    />
  );
};
```

---

### ポイント

**postMultipart の仕組み**:
1. `client.user.avatar.$url()` で URL を取得
2. `fetch` で直接 `multipart/form-data` を送信
3. Cookie 認証は `credentials: "include"` で自動送信

**Hono RPC が multipart 未対応の理由**:
- Hono RPC は JSON ベースの型安全通信に特化
- ファイルアップロードは `postMultipart` ヘルパーで補完

**UI/UX のベストプラクティス**:
- `isUploading` 状態でボタンを無効化
- アップロード中はローディングスピナーを表示
- `e.target.value = ""` で同じファイルを再選択可能に

---

## 追加パターン

### Server Component でのデータフェッチ

Server Component で API を呼び出す場合の例です。

```tsx
// app/health/page.tsx
import { publicClient } from "@/lib/api";

const checkApiHealth = async () => {
  try {
    const res = await publicClient.health.$get();
    if (res.ok) {
      const data = await res.json();
      return { ok: true, message: "Operational", environment: data.environment };
    }
    return { ok: false, message: `HTTP ${res.status}` };
  } catch {
    return { ok: false, message: "Connection failed" };
  }
};

// Server Component（async 関数）
const HealthPage = async () => {
  const health = await checkApiHealth();

  return (
    <div>
      <p>Status: {health.ok ? "OK" : "Error"}</p>
      <p>Message: {health.message}</p>
    </div>
  );
};

export default HealthPage;
```

**ポイント**:
- Server Component は `async` 関数として定義
- `"use client"` ディレクティブなし
- 認証が必要な場合は `createServerClient()` を使用

---

### フォームバリデーションの拡張

`@packages/schema` のスキーマを拡張して、クライアント固有のバリデーションを追加します。

```tsx
// app/auth/signup/_lib/validations.ts
import { SignupInputSchema } from "@packages/schema/auth";
import { z } from "zod";

export const signupFormSchema = SignupInputSchema.extend({
  confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;
```

**ポイント**:
- `.extend()` で新しいフィールドを追加
- `.refine()` で複数フィールドにまたがるバリデーション
- `path` でエラーを表示するフィールドを指定
