import "../global.css";
import { Toaster } from "sonner-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Linking, View } from "react-native";
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

function resolveDeepLink(url: string): { screen: "task"; taskId: string } | null {
  try {
    const parsed = new URL(url);
    const taskId = parsed.searchParams.get("taskId");
    if (!taskId) return null;
    const isTasksRoute = parsed.hostname === "tasks" || parsed.pathname === "/tasks";
    if (isTasksRoute) return { screen: "task", taskId };
  } catch (e) {
    if (__DEV__) console.warn("resolveDeepLink: failed to parse URL", url, e);
  }
  return null;
}

function RootGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const lastNotificationResponse = useLastNotificationResponse();
  const hasHandledInitialUrlRef = useRef(false);

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
        const timer = setTimeout(() => router.push(`/(tabs)/tasks/${data.taskId}/comments`), 500);
        return () => clearTimeout(timer);
      }
    } else if (data?.screen === "tasks") {
      router.push("/(tabs)/tasks");
    }
  }, [lastNotificationResponse, isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const navigate = (url: string) => {
      const link = resolveDeepLink(url);
      if (link?.screen === "task") router.push(`/(tabs)/tasks/${link.taskId}`);
    };

    if (!hasHandledInitialUrlRef.current) {
      hasHandledInitialUrlRef.current = true;
      Linking.getInitialURL().then((url) => {
        if (url) setTimeout(() => navigate(url), 0);
      });
    }

    const sub = Linking.addEventListener("url", ({ url }) => navigate(url));
    return () => sub.remove();
  }, [isAuthenticated, isLoading, router]);

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
        <Toaster
          position="top-center"
          positionerStyle={{ paddingHorizontal: 16 }}
        />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
