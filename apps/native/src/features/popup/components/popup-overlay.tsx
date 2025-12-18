import { useCallback } from "react";
import { Modal } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { withUniwind } from "uniwind";
import { usePopup } from "@/contexts/popup-context";
import { PopupCard } from "./popup-card";

const AnimatedView = withUniwind(Animated.View);

/**
 * PopupOverlay
 * ポップアップを全画面オーバーレイで表示
 * 背景タップでは閉じない（ボタン操作のみ）
 */
export const PopupOverlay = () => {
  const { currentPopup, dismiss, queueLength } = usePopup();

  const handleClose = useCallback(() => {
    dismiss();
  }, [dismiss]);

  if (!currentPopup) {
    return null;
  }

  return (
    <Modal
      visible={!!currentPopup}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <AnimatedView
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="flex-1 items-center justify-center bg-black/50 p-6"
      >
        <PopupCard
          title={currentPopup.title}
          message={currentPopup.message}
          imageUrl={currentPopup.imageUrl}
          closeButtonLabel={currentPopup.closeButtonLabel}
          onClose={handleClose}
          remainingCount={queueLength - 1}
        />
      </AnimatedView>
    </Modal>
  );
};
