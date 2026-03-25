import { Stack } from "expo-router";

export default function TaskDetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="comments" options={{ presentation: "modal" }} />
      <Stack.Screen name="photos" options={{ presentation: "modal" }} />
      <Stack.Screen name="files" options={{ presentation: "modal" }} />
    </Stack>
  );
}
