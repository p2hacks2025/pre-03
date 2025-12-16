import { useRouter } from "expo-router";
import { Card } from "heroui-native";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";
import type { WeekInfo } from "../types";
import { MonthIndicator } from "./month-indicator";
import { WeekContentPlaceholder } from "./week-content-placeholder";
import { WeekDatesRow } from "./week-dates-row";

const StyledView = withUniwind(View);

interface WeekCardProps {
  week: WeekInfo;
}

export const WeekCard = ({ week }: WeekCardProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(app)/(tabs)/reflection/${week.weekId}`);
  };

  return (
    <Pressable onPress={handlePress}>
      <Card className="mb-3">
        <Card.Body className="p-3">
          <StyledView className="flex-row items-center">
            {/* 左: 月表示 */}
            <MonthIndicator month={week.primaryMonth} />

            {/* 右: 日付行 */}
            <WeekDatesRow days={week.days} />
          </StyledView>

          {/* 下: コンテンツエリア */}
          <WeekContentPlaceholder weekId={week.weekId} />
        </Card.Body>
      </Card>
    </Pressable>
  );
};
