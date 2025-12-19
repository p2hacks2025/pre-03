import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledAnimatedView = withUniwind(Animated.View);

const HEADER_HEIGHT = 40;

type Direction = "up" | "down";

interface UseStickyAnimationOptions<T extends number> {
  value: T;
  getDirection: (prev: T, current: T) => Direction;
}

interface UseStickyAnimationResult<T> {
  prevValue: T | null;
  offsetAnim: Animated.Value;
  direction: Direction;
}

const useStickyAnimation = <T extends number>({
  value,
  getDirection,
}: UseStickyAnimationOptions<T>): UseStickyAnimationResult<T> => {
  const [prevValue, setPrevValue] = useState<T | null>(null);
  const offsetAnim = useRef(new Animated.Value(0)).current;
  const directionRef = useRef<Direction>("up");
  const lastValueRef = useRef(value);

  useEffect(() => {
    if (value !== lastValueRef.current && prevValue === null) {
      const direction = getDirection(lastValueRef.current, value);
      directionRef.current = direction;
      setPrevValue(lastValueRef.current as T);
      lastValueRef.current = value;

      const startOffset = direction === "up" ? -HEADER_HEIGHT : HEADER_HEIGHT;
      offsetAnim.setValue(startOffset);

      Animated.timing(offsetAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setPrevValue(null);
      });
    }
  }, [value, prevValue, getDirection, offsetAnim]);

  return { prevValue, offsetAnim, direction: directionRef.current };
};

interface StickyYearHeaderProps {
  year: number;
}

export const StickyYearHeader = ({ year }: StickyYearHeaderProps) => {
  const getYearDirection = useCallback(
    (prev: number, current: number): Direction =>
      current < prev ? "up" : "down",
    [],
  );

  const { prevValue, offsetAnim, direction } = useStickyAnimation({
    value: year,
    getDirection: getYearDirection,
  });

  return (
    <StyledView className="h-10 flex-1 justify-center overflow-hidden">
      {prevValue !== null && (
        <StyledAnimatedView
          className="absolute h-10 w-full justify-center"
          style={{
            transform: [
              {
                translateY: Animated.add(
                  offsetAnim,
                  direction === "up" ? HEADER_HEIGHT : -HEADER_HEIGHT,
                ),
              },
            ],
          }}
        >
          <StyledText className="text-center font-bold text-foreground text-xl">
            {prevValue}年
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
  // month は 1-12 形式
  const getMonthDirection = useCallback(
    (prev: number, current: number): Direction => {
      if (prev === 12 && current === 1) return "down"; // 12月→1月は未来へ
      if (prev === 1 && current === 12) return "up"; // 1月→12月は過去へ
      return current < prev ? "up" : "down";
    },
    [],
  );

  const { prevValue, offsetAnim, direction } = useStickyAnimation({
    value: month,
    getDirection: getMonthDirection,
  });

  return (
    <StyledView className="h-10 w-16 items-start justify-center overflow-hidden">
      {prevValue !== null && (
        <StyledAnimatedView
          className="absolute h-10 w-full items-start justify-center"
          style={{
            transform: [
              {
                translateY: Animated.add(
                  offsetAnim,
                  direction === "up" ? HEADER_HEIGHT : -HEADER_HEIGHT,
                ),
              },
            ],
          }}
        >
          <StyledText className="font-bold text-2xl text-foreground">
            {prevValue}月
          </StyledText>
        </StyledAnimatedView>
      )}
      <StyledAnimatedView
        className="absolute h-10 w-full items-start justify-center"
        style={{ transform: [{ translateY: offsetAnim }] }}
      >
        <StyledText className="font-bold text-2xl text-foreground">
          {month}月
        </StyledText>
      </StyledAnimatedView>
    </StyledView>
  );
};
