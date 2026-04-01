import "../global.css";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { useLastNotificationResponse } from "expo-notifications";
import {
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from "@expo-google-fonts/ibm-plex-mono";
import { colors } from "@/constants/colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

function RootGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const lastNotificationResponse = useLastNotificationResponse();

  useEffect(() => {
    if (isLoading) return;
    const inTabs = segments[0] === "(tabs)";
    if (!isAuthenticated && inTabs) {
      router.replace("/login");
    } else if (isAuthenticated && !inTabs) {
      router.replace("/(tabs)/tasks");
    }
  }, [isAuthenticated, isLoading, segments[0]]);

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    const data = lastNotificationResponse?.notification.request.content.data;
    if (typeof data?.taskId === "string") {
      router.push(`/(tabs)/tasks/${data.taskId}`);
      if (data?.screen === "comments") {
        setTimeout(() => router.push(`/(tabs)/tasks/${data.taskId}/comments`), 500);
      }
    } else if (data?.screen === "tasks") {
      router.push("/(tabs)/tasks");
    }
  }, [lastNotificationResponse, isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.eggWhite }}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.eggWhite }}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.charcoal }}>
      <KeyboardProvider>
        <StatusBar style="light" />
        <AuthProvider>
          <RootGuard />
        </AuthProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
