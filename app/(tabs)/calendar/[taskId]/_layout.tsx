import { Stack } from "expo-router";

export default function CalendarTaskDetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="comments" options={{ presentation: "modal" }} />
      <Stack.Screen name="photos" options={{ presentation: "modal" }} />
      <Stack.Screen name="files" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="add-attachment"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.3, 1.0],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: true,
          sheetExpandsWhenScrolledToEdge: true,
        }}
      />
    </Stack>
  );
}
