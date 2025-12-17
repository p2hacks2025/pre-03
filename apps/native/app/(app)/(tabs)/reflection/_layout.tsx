import { Stack } from "expo-router";

export default function ReflectionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[week]"
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
