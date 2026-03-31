import { Stack } from "expo-router";

export default function TasksLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-project-picker" options={{ presentation: "modal" }} />
      <Stack.Screen name="add-task-form" options={{ presentation: "modal" }} />
      <Stack.Screen name="list-picker" options={{ presentation: "modal" }} />
      <Stack.Screen name="date-picker" options={{ presentation: "modal" }} />
      <Stack.Screen name="add-assignees-picker" options={{ presentation: "modal" }} />
      <Stack.Screen name="add-goal-picker" options={{ presentation: "modal" }} />
      <Stack.Screen name="multi-picker" options={{ presentation: "modal" }} />
      <Stack.Screen name="grouped-picker" options={{ presentation: "modal" }} />
    </Stack>
  );
}
