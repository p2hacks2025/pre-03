import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

export const CalendarScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <StyledView
      className="flex-1 items-center justify-center bg-background px-4"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <StyledText className="mb-8 font-bold text-2xl text-foreground">
        振り返りカレンダー画面
      </StyledText>

      <Button
        onPress={() => router.push("/(app)/(tabs)/reflection/2025-01-01")}
      >
        <Button.Label>詳細を見る</Button.Label>
      </Button>
    </StyledView>
  );
};
