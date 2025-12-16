import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { TimelineCard } from "@/features/auth/timeline";

const StyledView = withUniwind(View);
const _StyledText = withUniwind(Text);
const StyledTouchableOpacity = withUniwind(TouchableOpacity);
const StyledIonicons = withUniwind(Ionicons);
const StyledAnimatedView = withUniwind(Animated.View);
const StyledAnimatedText = withUniwind(Animated.Text);

// サンプルデータ
const SAMPLE_TIMELINE_DATA = [
  {
    id: "1",
    username: "poyopoyo",
    userSubtext: "ぽよぽよ",
    content:
      "poyo~~~~~~~~~~~~~~~~~~~~いろはにほへとチリぬるをあああああああああああああああああああ",
    timeAgo: "経過時間",
  },
  {
    id: "2",
    username: "tanaka_taro",
    userSubtext: "田中太郎",
    content: "今日はとても良い天気ですね。散歩に行ってきました。",
    timeAgo: "5分前",
  },
  {
    id: "3",
    username: "yamada_hanako",
    userSubtext: "山田花子",
    content:
      "新しいカフェに行ってきました！コーヒーがとても美味しかったです。また行きたいと思います。",
    timeAgo: "1時間前",
  },
  {
    id: "4",
    username: "sato_ichiro",
    userSubtext: "佐藤一郎",
    content: "プロジェクトが無事に完了しました。チームのみんなに感謝です。",
    timeAgo: "3時間前",
  },
  {
    id: "5",
    username: "sato_ichiro",
    userSubtext: "佐藤一郎",
    content: "プロジェクトが無事に完了しました。チームのみんなに感謝です。",
    timeAgo: "3時間前",
  },
  {
    id: "6",
    username: "sato_ichiro",
    userSubtext: "佐藤一郎",
    content: "プロジェクトが無事に完了しました。チームのみんなに感謝です。",
    timeAgo: "3時間前",
  },
  {
    id: "7",
    username: "sato_ichiro",
    userSubtext: "佐藤一郎",
    content: "プロジェクトが無事に完了しました。チームのみんなに感謝です。",
    timeAgo: "3時間前",
  },
];

// ヘッダーの高さ（スクロール時の収納に使用）
const HEADER_HEIGHT = 70;

export const HomeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  // スクロール位置に応じてヘッダーを上に移動
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: "clamp",
  });

  // ヘッダーテキストの透明度
  const headerTextOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  return (
    <StyledView className="flex-1 bg-background">
      {/* スクロール可能なタイムライン */}
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + insets.top }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        <View className="gap-3 p-4">
          {SAMPLE_TIMELINE_DATA.map((item) => (
            <TimelineCard
              key={item.id}
              username={item.username}
              userSubtext={item.userSubtext}
              content={item.content}
              timeAgo={item.timeAgo}
              avatarUri={require("../../../assets/user-icon.png")}
            />
          ))}
        </View>
      </Animated.ScrollView>

      {/* ヘッダー（スクロールで収納） */}
      <StyledAnimatedView
        className="absolute top-0 right-0 left-0 border-border border-b bg-blue-500 px-4"
        style={{
          paddingTop: insets.top + 22,
          paddingBottom: 12,
          transform: [{ translateY: headerTranslateY }],
        }}
      >
        <StyledAnimatedText
          className="font-bold text-foreground text-xl"
          style={{ opacity: headerTextOpacity }}
        >
          タイムライン
        </StyledAnimatedText>
      </StyledAnimatedView>

      {/* FAB: 日記追加ボタン（右下に固定） */}
      <StyledView
        className="absolute right-0 bottom-0 p-4"
        style={{ paddingBottom: insets.bottom - 20 }}
      >
        <StyledTouchableOpacity
          className="size-14 items-center justify-center rounded-full bg-blue-500 shadow-lg"
          onPress={() => router.push("/(app)/diary/new")}
        >
          <StyledIonicons
            name="add"
            size={32}
            className="text-primary-foreground"
          />
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
};
