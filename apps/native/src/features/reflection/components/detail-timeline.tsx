import { Text, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

/**
 * 振り返り詳細画面の住人の様子タブコンポーネント
 *
 * タイムライン表示のプレースホルダーコンポーネント。
 * #18 で実装予定のため、現在は空のコンポーネントとして定義。
 */
export const DetailTimeline = () => {
  return (
    <StyledView className="flex-1 items-center justify-center p-4">
      <StyledText className="text-center text-muted">
        住人の様子は #18 で実装予定です
      </StyledText>
    </StyledView>
  );
};
