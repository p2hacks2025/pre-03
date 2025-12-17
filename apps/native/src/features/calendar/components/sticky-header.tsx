import { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledAnimatedView = withUniwind(Animated.View);

const HEADER_HEIGHT = 40;

type Direction = "up" | "down";

interface StickyYearHeaderProps {
  year: number;
}

export const StickyYearHeader = ({ year }: StickyYearHeaderProps) => {
  const [prevYear, setPrevYear] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const offsetAnim = useRef(new Animated.Value(0)).current;
  const directionRef = useRef<Direction>("up");
  const lastYearRef = useRef(year);

  useEffect(() => {
    if (year !== lastYearRef.current && !isAnimating) {
      const direction: Direction = year < lastYearRef.current ? "up" : "down";
      directionRef.current = direction;
      setPrevYear(lastYearRef.current);
      lastYearRef.current = year;
      setIsAnimating(true);

      const startOffset = direction === "up" ? -HEADER_HEIGHT : HEADER_HEIGHT;
      offsetAnim.setValue(startOffset);

      Animated.timing(offsetAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setPrevYear(null);
        setIsAnimating(false);
      });
    }
  }, [year, isAnimating, offsetAnim]);

  return (
    <StyledView className="h-10 flex-1 justify-center overflow-hidden">
      {prevYear !== null && (
        <StyledAnimatedView
          className="absolute h-10 w-full justify-center"
          style={{
            transform: [
              {
                translateY: Animated.add(
                  offsetAnim,
                  directionRef.current === "up"
                    ? HEADER_HEIGHT
                    : -HEADER_HEIGHT,
                ),
              },
            ],
          }}
        >
          <StyledText className="text-center font-bold text-foreground text-xl">
            {prevYear}年
          </StyledText>
        </StyledAnimatedView>
      )}
      <StyledAnimatedView
        className="absolute h-10 w-full justify-center"
        style={{ transform: [{ translateY: offsetAnim }] }}
      >
        <StyledText className="text-center font-bold text-foreground text-xl">
          {year}年
        </StyledText>
      </StyledAnimatedView>
    </StyledView>
  );
};

interface StickyMonthHeaderProps {
  month: number;
}

export const StickyMonthHeader = ({ month }: StickyMonthHeaderProps) => {
  const [prevMonth, setPrevMonth] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const offsetAnim = useRef(new Animated.Value(0)).current;
  const directionRef = useRef<Direction>("up");
  const lastMonthRef = useRef(month);

  useEffect(() => {
    if (month !== lastMonthRef.current && !isAnimating) {
      const lastMonth = lastMonthRef.current;
      let direction: Direction;
      if (lastMonth === 11 && month === 0) {
        direction = "down"; // 12月→1月は未来へ
      } else if (lastMonth === 0 && month === 11) {
        direction = "up"; // 1月→12月は過去へ
      } else {
        direction = month < lastMonth ? "up" : "down";
      }

      directionRef.current = direction;
      setPrevMonth(lastMonth);
      lastMonthRef.current = month;
      setIsAnimating(true);

      const startOffset = direction === "up" ? -HEADER_HEIGHT : HEADER_HEIGHT;
      offsetAnim.setValue(startOffset);

      Animated.timing(offsetAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setPrevMonth(null);
        setIsAnimating(false);
      });
    }
  }, [month, isAnimating, offsetAnim]);

  return (
    <StyledView className="h-10 w-12 items-center justify-center overflow-hidden">
      {prevMonth !== null && (
        <StyledAnimatedView
          className="absolute h-10 w-full items-center justify-center"
          style={{
            transform: [
              {
                translateY: Animated.add(
                  offsetAnim,
                  directionRef.current === "up"
                    ? HEADER_HEIGHT
                    : -HEADER_HEIGHT,
                ),
              },
            ],
          }}
        >
          <StyledText className="font-bold text-2xl text-foreground">
            {(prevMonth ?? 0) + 1}月
          </StyledText>
        </StyledAnimatedView>
      )}
      <StyledAnimatedView
        className="absolute h-10 w-full items-center justify-center"
        style={{ transform: [{ translateY: offsetAnim }] }}
      >
        <StyledText className="font-bold text-2xl text-foreground">
          {month + 1}月
        </StyledText>
      </StyledAnimatedView>
    </StyledView>
  );
};
