/**
 * 成功メッセージを出力
 * @param {string} message
 */
export const log = (message) => {
  console.log(`✓ ${message}`);
};

/**
 * 警告メッセージを出力
 * @param {string} message
 */
export const warn = (message) => {
  console.log(`⚠ ${message}`);
};

/**
 * エラーメッセージを出力
 * @param {string} message
 */
export const error = (message) => {
  console.error(`✗ ${message}`);
};

export const printDirenvReloadMessage = () => {
  console.log("\n📝 環境変数を反映するため、以下のコマンドを実行してください:");
  console.log("   direnv reload\n");
};
