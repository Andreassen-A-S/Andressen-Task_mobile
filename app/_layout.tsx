// @ts-ignore -- NativeWind CSS side-effect, processed by Metro not TypeScript
import "../global.css";
import { Toaster } from "sonner-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { CancelableNavigationTask, runAfterNavigationFrame } from "@/lib/navigationTiming";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 200,
  fade: true,
});

function SplashScreenController({ fontsReady }: { fontsReady: boolean }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const segments = useSegments();
  const hasHiddenSplash = useRef(false);
  const rootSegment = segments[0];
  const isDestinationReady = isAuthenticated
    ? rootSegment === "(tabs)" || rootSegment === "comments"
    : rootSegment === "login";

  useEffect(() => {
    if (
      hasHiddenSplash.current ||
      !fontsReady ||
      isInitializing ||
      !isDestinationReady
    ) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      hasHiddenSplash.current = true;
      SplashScreen.hide();
    });

    return () => cancelAnimationFrame(frame);
  }, [fontsReady, isDestinationReady, isInitializing]);

  return null;
}

function RootNavigator() {
  const { isAuthenticated, isInitializing } = useAuth();
  const router = useRouter();
  const lastNotificationResponse = useLastNotificationResponse();
  const handledNotificationIdRef = useRef<string | null>(null);
  useDeepLinkNavigation({ isAuthenticated, isInitializing });

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

  // Do not mount a provisional route while the stored session is unresolved.
  // The native splash remains visible until the correct route tree is mounted.
  if (isInitializing) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
        <Stack.Screen name="comments/[taskId]" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ animation: "none" }} />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" options={{ animation: "none" }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  useEffect(() => {
    if (fontError) console.warn("Unable to load app fonts", fontError);
  }, [fontError]);

  const fontsReady = fontsLoaded || !!fontError;

  return (
    <GestureHandlerRootView className="flex-1 bg-white">
      <KeyboardProvider>
        <StatusBar style="light" />
        <AuthProvider>
          <SplashScreenController fontsReady={fontsReady} />
          <RootNavigator />
        </AuthProvider>
        <Toaster
          position="top-center"
          positionerStyle={{ paddingHorizontal: 16 }}
        />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
