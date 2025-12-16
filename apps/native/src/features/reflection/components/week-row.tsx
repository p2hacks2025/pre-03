import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";
import type { WeekInfo } from "../types";
import { WeekContentPlaceholder } from "./week-content-placeholder";
import { WeekDatesRow } from "./week-dates-row";

const StyledView = withUniwind(View);

interface WeekRowProps {
  week: WeekInfo;
}

export const WeekRow = ({ week }: WeekRowProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(app)/(tabs)/reflection/${week.weekId}`);
  };

  return (
    <Pressable onPress={handlePress}>
      <StyledView className="mb-2">
        {/* 日付行 */}
        <WeekDatesRow days={week.days} />

        {/* コンテンツエリア */}
        <WeekContentPlaceholder weekId={week.weekId} />
      </StyledView>
    </Pressable>
  );
};
