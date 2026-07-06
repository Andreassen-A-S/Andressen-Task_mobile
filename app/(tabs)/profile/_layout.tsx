import { Stack } from "expo-router";
import { colors } from "@/constants/colors";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleStyle: {
          fontFamily: "Outfit_600SemiBold",
          fontSize: 18,
          fontWeight: "600",
        },
        headerTintColor: colors.textPrimary,
      }}
    >
      <Stack.Screen options={{
        headerShown: false,
      }} name="index" />
      <Stack.Screen options={{
        title: "Konto",
        headerTransparent: true,
        headerBackButtonDisplayMode: "minimal",
      }} name="account-settings" />
      <Stack.Screen options={{
        title: "Tema",
        headerTransparent: true,
        headerBackButtonDisplayMode: "minimal",
      }} name="theme" />
    </Stack>
  );
}
