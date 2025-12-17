import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);

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
    <StyledView style={styles.yearContainer}>
      {prevYear !== null && (
        <Animated.View
          style={[
            styles.yearTextContainer,
            {
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
            },
          ]}
        >
          <StyledText className="text-center font-bold text-foreground text-xl">
            {prevYear}年
          </StyledText>
        </Animated.View>
      )}
      <Animated.View
        style={[
          styles.yearTextContainer,
          {
            transform: [{ translateY: offsetAnim }],
          },
        ]}
      >
        <StyledText className="text-center font-bold text-foreground text-xl">
          {year}年
        </StyledText>
      </Animated.View>
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
    <StyledView style={styles.monthContainer}>
      {prevMonth !== null && (
        <Animated.View
          style={[
            styles.monthTextContainer,
            {
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
            },
          ]}
        >
          <StyledText className="font-bold text-2xl text-foreground">
            {(prevMonth ?? 0) + 1}月
          </StyledText>
        </Animated.View>
      )}
      <Animated.View
        style={[
          styles.monthTextContainer,
          {
            transform: [{ translateY: offsetAnim }],
          },
        ]}
      >
        <StyledText className="font-bold text-2xl text-foreground">
          {month + 1}月
        </StyledText>
      </Animated.View>
    </StyledView>
  );
};

const styles = StyleSheet.create({
  yearContainer: {
    flex: 1,
    height: HEADER_HEIGHT,
    overflow: "hidden",
    justifyContent: "center",
  },
  yearTextContainer: {
    position: "absolute",
    width: "100%",
    height: HEADER_HEIGHT,
    justifyContent: "center",
  },
  monthContainer: {
    width: 48,
    height: HEADER_HEIGHT,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  monthTextContainer: {
    position: "absolute",
    width: "100%",
    height: HEADER_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
});
