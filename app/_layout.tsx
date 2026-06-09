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
import { CancelableNavigationTask, runAfterNavigationFrame } from "@/lib/navigationTiming";

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
      const taskId = data.taskId;
      const hadOpenModal = router.canDismiss();
      if (hadOpenModal) router.dismissAll();
      const openComments = data?.screen === "comments";
      const commentId = typeof data?.commentId === "string" ? data.commentId : undefined;
      let navigationTask: CancelableNavigationTask | null = null;
      let pushTimer: ReturnType<typeof setTimeout> | null = null;
      const navigationTimer = setTimeout(() => {
        router.dismissTo("/(tabs)/tasks");
        pushTimer = setTimeout(() => {
          navigationTask = runAfterNavigationFrame(() => {
            router.push({
              pathname: "/(tabs)/tasks/[taskId]",
              params: {
                taskId,
                ...(openComments ? { openComments: "1", openCommentsRequestId: notifId } : {}),
                ...(commentId ? { commentId } : {}),
              },
            });
          });
        }, 220);
      }, hadOpenModal ? 450 : 0);
      return () => {
        clearTimeout(navigationTimer);
        if (pushTimer) clearTimeout(pushTimer);
        navigationTask?.cancel();
      };
    } else if (data?.screen === "tasks") {
      router.push("/(tabs)/tasks");
    }
  }, [lastNotificationResponse, isAuthenticated, isInitializing, router]);

  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
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
      <View className="flex-1 items-center justify-center bg-background">
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
