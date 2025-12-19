# 画像生成ワークフロー

## 概要

画像生成処理は2ステップに分離されており、各LLMの役割が明確化されています。

## アーキテクチャ

### 従来の問題点

```mermaid
flowchart LR
    A[日記] --> B[Gemini]
    C[現在画像] --> B
    D[ガイド画像] --> B
    B --> E[生成画像]

    subgraph "Geminiの負担（複数タスク）"
        B
    end
```

**問題**: Geminiが以下を同時処理しており、精度が不安定
1. 日記内容の理解・解釈
2. シーンの決定（何を描くか）
3. ブロック更新位置の判断
4. 画像生成

### 新アーキテクチャ

```mermaid
flowchart LR
    A[日記] --> B[GPT-5-nano]
    B --> C[シーン記述]
    C --> D[Gemini]
    E[現在画像] --> D
    F[ガイド画像] --> D
    D --> G[生成画像]

    subgraph "Step 1: 言語理解"
        B
    end

    subgraph "Step 2: 画像生成のみ"
        D
    end
```

**改善点**:
- **GPT-5-nano**: 日記→シーン記述（自然言語）に特化
- **Gemini**: 画像生成のシングルタスクに集中 → 精度向上

## 処理フロー

### daily-update

```mermaid
sequenceDiagram
    participant Job as daily-update job
    participant GPT as GPT-5-nano
    participant Gemini as Gemini
    participant Storage as Supabase Storage

    Job->>Job: 日記取得
    Job->>GPT: 日記内容を送信
    GPT-->>Job: シーン記述（自然言語）
    Job->>Job: 現在画像・ガイド画像取得
    Job->>Gemini: シーン記述 + 画像群を送信
    Gemini-->>Job: 生成画像
    Job->>Storage: 画像アップロード
```

### weekly-reset

```mermaid
sequenceDiagram
    participant Job as weekly-reset job
    participant GPT as GPT-5-nano
    participant Gemini as Gemini
    participant Storage as Supabase Storage

    Job->>Job: 週間投稿取得
    Job->>GPT: 投稿内容を送信
    GPT-->>Job: シーン記述（自然言語）
    loop 2回（2ブロック更新）
        Job->>Gemini: シーン記述 + 画像群を送信
        Gemini-->>Job: 生成画像
        Job->>Storage: 画像アップロード
    end
```

## LLM設定

設定は `lib/llm-config.ts` で一元管理されています。

```typescript
export const LLM_CONFIG = {
  sceneDescription: {
    model: "gpt-5-nano",
    maxCompletionTokens: 300,
  },
  imageGeneration: {
    model: "gemini-3-pro-image-preview",
    temperature: 0.1,
    seed: 1234,
    candidateCount: 1,
  },
} as const;
```

## プロンプト

### シーン記述生成（GPT-5-nano）

ファイル: `assets/prompts/scene_description.md`

日記内容から視覚的なシーン記述を生成します。

**出力例**:
- 入力: 「今日は友達とカフェに行った。美味しいケーキを食べながらたくさん話した。」
- 出力: 「明るいカフェで二人の友人がケーキを前に楽しそうに会話している」

### 画像生成（Gemini）

ファイル: `assets/prompts/image_generation_prompt.md`

シーン記述と参照画像から新しい画像を生成します。

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `lib/llm-config.ts` | LLM設定の一元管理 |
| `assets/prompts/scene_description.md` | シーン記述生成プロンプト |
| `assets/prompts/image_generation_prompt.md` | 画像生成プロンプト |
| `tasks/daily-update.ts` | 日次更新処理 |
| `tasks/weekly-reset.ts` | 週次リセット処理 |
