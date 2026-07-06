import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTitleStyle: {
          fontFamily: "Outfit_600SemiBold",
          fontSize: 18,
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen options={{
        title: "Konto",
        headerShown: true,
        headerTransparent: true,
        headerBackButtonDisplayMode: "minimal",
      }} name="account-settings" />
      <Stack.Screen options={{
        title: "Tema",
        headerShown: true,
        headerTransparent: true,
        headerBackButtonDisplayMode: "minimal",
      }} name="theme" />
    </Stack>
  );
}
