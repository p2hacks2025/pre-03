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

const WeekDatesRow = ({ days }: { days: DayInfo[] }) => {
  return (
    <StyledView className="flex-row justify-between px-2">
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
}

export const WeekRow = ({ week }: WeekRowProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(app)/(tabs)/reflection/${week.weekId}`);
  };

  return (
    <Pressable onPress={handlePress}>
      <StyledView className="mb-2">
        <WeekDatesRow days={week.days} />
        <WeekContent imageUrl={week.imageUrl} />
      </StyledView>
    </Pressable>
  );
};
