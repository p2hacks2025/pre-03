import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

export const HomeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <StyledView
      className="flex-1 items-center justify-center bg-background px-4"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <StyledText className="mb-8 font-bold text-2xl text-foreground">
        ホーム画面
      </StyledText>

      <Button onPress={() => router.push("/(app)/diary/new")}>
        <Button.Label>日記を追加</Button.Label>
      </Button>
    </StyledView>
  );
};
