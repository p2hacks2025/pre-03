import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

/**
 * アプリがバックグラウンドからフォアグラウンドに復帰した時にコールバックを実行するフック
 *
 * @param onForeground フォアグラウンド復帰時に呼び出されるコールバック
 */
export const useAppStateRefresh = (onForeground: () => void) => {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const onForegroundRef = useRef(onForeground);

  // コールバックの参照を更新（再レンダリング時にイベントリスナーを再登録しない）
  useEffect(() => {
    onForegroundRef.current = onForeground;
  }, [onForeground]);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      // バックグラウンド/非アクティブ → アクティブ への変化を検知
      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        onForegroundRef.current();
      }
      appState.current = nextState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, []);
};
