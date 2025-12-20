export interface ImageViewerModalProps {
  /**
   * モーダルの表示状態
   */
  visible: boolean;

  /**
   * 表示する画像のURL
   */
  imageUrl: string;

  /**
   * モーダルを閉じる際のコールバック
   */
  onClose: () => void;
}
