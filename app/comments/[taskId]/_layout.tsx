import { Stack } from "expo-router";

export default function CommentsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="assignees"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.5, 1.0],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: true,
          sheetExpandsWhenScrolledToEdge: true,
        }}
      />
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
