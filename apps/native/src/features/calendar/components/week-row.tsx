import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { withUniwind } from "uniwind";
import type { DayInfo, WeekInfo } from "../types";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledImage = withUniwind(Image);

/**
 * 曜日に応じたテキストカラークラスを取得
 * - 日曜日: 赤色 (text-red-500)
 * - 土曜日: 青色 (text-blue-500) - isWeekend が true かつ日曜でない場合
 * - 平日: 通常色 (text-foreground)
 */
const getTextColorClass = (day: DayInfo): string => {
  const isSunday = day.date.getDay() === 0;
  if (isSunday) return "text-red-500";
  if (day.isWeekend) return "text-blue-500"; // 土曜日
  return "text-foreground";
};

const MonthIndicator = ({ month }: { month: number }) => {
  return (
    <StyledView className="w-16 items-start justify-center">
      <StyledText className="font-bold text-2xl text-foreground">
        {month}月
      </StyledText>
    </StyledView>
  );
};

interface WeekDatesRowProps {
  days: DayInfo[];
  showMonthIndicator?: boolean;
  month?: number;
  entryDates: string[];
}

const WeekDatesRow = ({
  days,
  showMonthIndicator = false,
  month,
  entryDates,
}: WeekDatesRowProps) => {
  return (
    <StyledView className="flex-row items-center">
      {showMonthIndicator && month !== undefined ? (
        <MonthIndicator month={month} />
      ) : (
        <StyledView className="w-16" />
      )}
      <StyledView className="flex-1 flex-row justify-between px-4">
        {days.map((day) => {
          const hasEntry = entryDates.includes(day.dateString);
          return (
            <StyledView key={day.dateString} className="w-8 items-center">
              <StyledView
                className={`h-9 w-9 items-center justify-center rounded-full ${hasEntry ? "border-[2px]" : ""}`}
                style={hasEntry ? { borderColor: "#4ECCDD" } : undefined}
              >
                <StyledText
                  className={`text-base ${getTextColorClass(day)} ${day.isToday ? "font-bold" : "font-medium"}`}
                >
                  {day.day}
                </StyledText>
              </StyledView>
            </StyledView>
          );
        })}
      </StyledView>
    </StyledView>
  );
};

const WeekContent = ({ imageUrl }: { imageUrl: string | null }) => {
  if (imageUrl === null) {
    return (
      <StyledView className="mt-2 h-48 items-center justify-center overflow-hidden rounded-lg bg-surface-secondary">
        <StyledImage
          source={require("../../../../assets/world-example.png")}
          className="h-full w-full"
          resizeMode="contain"
        />
      </StyledView>
    );
  }

  return (
    <StyledView className="mt-2 h-48 items-center justify-center overflow-hidden rounded-lg bg-surface-secondary">
      <StyledImage
        source={{ uri: imageUrl }}
        className="h-full w-full"
        resizeMode="contain"
      />
    </StyledView>
  );
};
interface WeekRowProps {
  week: WeekInfo;
  showMonthIndicator?: boolean;
  month?: number;
  entryDates: string[];
}

export const WeekRow = ({
  week,
  showMonthIndicator = false,
  month,
  entryDates,
}: WeekRowProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(app)/(tabs)/reflection/${week.weekId}`);
  };

  return (
    <Pressable onPress={handlePress}>
      <StyledView className="mb-2">
        <WeekDatesRow
          days={week.days}
          showMonthIndicator={showMonthIndicator}
          month={month}
          entryDates={entryDates}
        />
        <StyledView className="ml-16">
          <WeekContent imageUrl={week.imageUrl} />
        </StyledView>
      </StyledView>
    </Pressable>
  );
};
