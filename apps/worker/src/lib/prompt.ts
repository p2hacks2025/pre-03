/**
 * プロンプトテンプレートのユーティリティ
 */

export type TemplateVariables = Record<string, string | number>;

/**
 * テンプレート文字列の変数を置換する
 *
 * @example
 * ```ts
 * const result = interpolatePrompt(
 *   "Hello {name}, you have {count} messages",
 *   { name: "Alice", count: 5 }
 * );
 * // => "Hello Alice, you have 5 messages"
 * ```
 */
export const interpolatePrompt = (
  template: string,
  variables: TemplateVariables,
): string => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`{${key}}`, String(value));
  }
  return result;
};

/**
 * テンプレート文字列から未置換の変数名を取得する
 *
 * @example
 * ```ts
 * const vars = getUnreplacedVariables("Hello {name}, {missing}!");
 * // => ["name", "missing"]
 * ```
 */
export const getUnreplacedVariables = (prompt: string): string[] => {
  const regex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const matches = [...prompt.matchAll(regex)].map((match) => match[1]);
  return [...new Set(matches)];
};
