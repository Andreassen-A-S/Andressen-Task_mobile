// @ts-ignore -- NativeWind CSS side-effect, processed by Metro not TypeScript
import "../global.css";
import { Toaster } from "sonner-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { useDeepLinkNavigation } from "@/hooks/useDeepLinkNavigation";
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
  const { isAuthenticated, isInitializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const lastNotificationResponse = useLastNotificationResponse();
  const handledNotificationIdRef = useRef<string | null>(null);
  useDeepLinkNavigation({ isAuthenticated, isInitializing });

  useEffect(() => {
    if (isInitializing) return;
    const inTabs = segments[0] === "(tabs)";
    if (!isAuthenticated && inTabs) {
      router.replace("/login");
    } else if (isAuthenticated && !inTabs) {
      router.replace("/(tabs)/tasks");
    }
  }, [isAuthenticated, isInitializing, segments[0]]);

  useEffect(() => {
    if (!isAuthenticated || isInitializing) return;
    const response = lastNotificationResponse;
    const notifId = response?.notification.request.identifier;
    if (!notifId || handledNotificationIdRef.current === notifId) return;
    handledNotificationIdRef.current = notifId;

    const data = response.notification.request.content.data;
    if (typeof data?.taskId === "string") {
      router.navigate("/(tabs)/tasks");
      router.push(`/(tabs)/tasks/${data.taskId}`);
      if (data?.screen === "comments") {
        const timer = setTimeout(() => router.push(`/(tabs)/tasks/${data.taskId}/comments`), 500);
        return () => clearTimeout(timer);
      }
    } else if (data?.screen === "tasks") {
      router.push("/(tabs)/tasks");
    }
  }, [lastNotificationResponse, isAuthenticated, isInitializing]);

  if (isInitializing) {
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
        <Toaster
          position="top-center"
          positionerStyle={{ paddingHorizontal: 16 }}
        />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
