import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { withUniwind } from "uniwind";
import type { DayInfo, WeekInfo } from "../types";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledImage = withUniwind(Image);

const getTextColorClass = (day: DayInfo): string => {
  const isSunday = day.date.getDay() === 0;
  if (isSunday) return "text-red-500";
  if (day.isWeekend) return "text-accent";
  return "text-foreground";
};

const MonthIndicator = ({ month }: { month: number }) => {
  return (
    <StyledView className="items-center justify-center pr-2">
      <StyledText className="font-bold text-2xl text-foreground">
        {month + 1}月
      </StyledText>
    </StyledView>
  );
};

interface WeekDatesRowProps {
  days: DayInfo[];
  showMonthIndicator?: boolean;
  month?: number;
}

const WeekDatesRow = ({
  days,
  showMonthIndicator = false,
  month,
}: WeekDatesRowProps) => {
  return (
    <StyledView className="flex-row items-center">
      {showMonthIndicator && month !== undefined ? (
        <MonthIndicator month={month} />
      ) : (
        <StyledView className="w-12" />
      )}
      <StyledView className="flex-1 flex-row justify-between px-2">
        {days.map((day) => (
          <StyledView key={day.dateString} className="w-8 items-center">
            <StyledText
              className={`text-base ${getTextColorClass(day)} ${day.isToday ? "font-bold" : "font-medium"}`}
            >
              {day.day}
            </StyledText>
          </StyledView>
        ))}
      </StyledView>
    </StyledView>
  );
};

const WeekContent = ({ imageUrl }: { imageUrl: string | null }) => {
  return (
    <StyledView className="mt-2 h-48 items-center justify-center overflow-hidden rounded-lg bg-surface-secondary">
      <StyledImage
        source={
          imageUrl
            ? { uri: imageUrl }
            : require("../../../../assets/demo/demo-sekai.png")
        }
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
}

export const WeekRow = ({
  week,
  showMonthIndicator = false,
  month,
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
        />
        <StyledView className="ml-12">
          <WeekContent imageUrl={week.imageUrl} />
        </StyledView>
      </StyledView>
    </Pressable>
  );
};
