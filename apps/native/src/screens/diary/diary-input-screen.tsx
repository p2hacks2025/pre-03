import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

export const DiaryInputScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <StyledView
      className="flex-1 items-center justify-center bg-background px-4"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <StyledText className="mb-8 font-bold text-2xl text-foreground">
        日記入力画面
      </StyledText>

      <Button variant="secondary" onPress={() => router.back()}>
        <Button.Label>閉じる</Button.Label>
      </Button>
    </StyledView>
  );
};
