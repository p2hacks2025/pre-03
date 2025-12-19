/**
 * LLM設定の一元管理
 *
 * 各タスクで使用するLLMのモデル名とパラメータを定義
 */

export const LLM_CONFIG = {
  /**
   * シーン記述生成用（日記→自然言語のシーン記述）
   * - 用途: 日記内容から画像生成用のシーン記述を生成
   * - 出力例: 「男女二人がベンチに座って星空を見ている」
   */
  sceneDescription: {
    model: "gpt-5-nano",
    maxCompletionTokens: 300,
  },

  /**
   * 画像生成用（シーン記述+画像→新しい画像）
   * - 用途: シーン記述と参照画像から新しい画像を生成
   * - Geminiの画像生成に特化したシングルタスク
   */
  imageGeneration: {
    model: "gemini-3-pro-image-preview",
    temperature: 0.1,
    seed: 1234,
    candidateCount: 1,
  },
} as const;

export type LLMConfigKey = keyof typeof LLM_CONFIG;
