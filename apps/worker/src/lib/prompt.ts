/**
 * プロンプトテンプレートユーティリティ
 */

export type TemplateVariables = Record<string, string | number>;

/**
 * テンプレート文字列内の変数を置換する
 * {variable_name} 形式の変数を対応する値で置換
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
 * テンプレート文字列内の未置換変数を検出する
 * 置換されなかった変数名の配列を返す
 */
export const getUnreplacedVariables = (prompt: string): string[] => {
  const regex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const matches = [...prompt.matchAll(regex)].map((match) => match[1]);
  return [...new Set(matches)];
};
