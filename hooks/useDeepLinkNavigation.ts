import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Linking } from "react-native";
import { resolveDeepLink } from "@/lib/deepLinks";
import { CancelableNavigationTask, runAfterNavigationFrame } from "@/lib/navigationTiming";

interface UseDeepLinkNavigationOptions {
  isAuthenticated: boolean;
  isInitializing: boolean;
}

export function useDeepLinkNavigation({ isAuthenticated, isInitializing }: UseDeepLinkNavigationOptions) {
  const router = useRouter();
  const hasHandledInitialUrlRef = useRef(false);
  const pendingDeepLinkRef = useRef<string | null>(null);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const isInitializingRef = useRef(isInitializing);
  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationTaskRef = useRef<CancelableNavigationTask | null>(null);

  useEffect(() => { isAuthenticatedRef.current = isAuthenticated; });
  useEffect(() => { isInitializingRef.current = isInitializing; });

  const cancelPendingNavigation = useCallback(() => {
    if (navigationTimerRef.current) {
      clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }
    if (pushTimerRef.current) {
      clearTimeout(pushTimerRef.current);
      pushTimerRef.current = null;
    }
    navigationTaskRef.current?.cancel();
    navigationTaskRef.current = null;
  }, []);

  const navigate = useCallback((url: string) => {
    const link = resolveDeepLink(url);
    if (link?.screen === "task") {
      cancelPendingNavigation();
      const hadOpenModal = router.canDismiss();
      if (hadOpenModal) router.dismissAll();
      navigationTimerRef.current = setTimeout(() => {
        navigationTimerRef.current = null;
        router.dismissTo("/(tabs)/tasks");
        pushTimerRef.current = setTimeout(() => {
          pushTimerRef.current = null;
          navigationTaskRef.current = runAfterNavigationFrame(() => {
            navigationTaskRef.current = null;
            router.push({
              pathname: "/(tabs)/tasks/[taskId]",
              params: { taskId: link.taskId },
            });
          });
        }, 220);
      }, hadOpenModal ? 450 : 0);
    }
  }, [cancelPendingNavigation, router]);

  useEffect(() => cancelPendingNavigation, [cancelPendingNavigation]);

  useEffect(() => {
    // Read the launch URL before auth is known; some platforms clear it after startup.
    if (!hasHandledInitialUrlRef.current) {
      hasHandledInitialUrlRef.current = true;
      Linking.getInitialURL()
        .then((url) => {
          if (!url) return;
          if (isAuthenticatedRef.current && !isInitializingRef.current) {
            navigate(url);
          } else {
            pendingDeepLinkRef.current = url;
          }
        })
        .catch((e) => {
          if (__DEV__) console.warn("getInitialURL failed", e);
        });
    }

    if (isAuthenticated && !isInitializing && pendingDeepLinkRef.current) {
      const url = pendingDeepLinkRef.current;
      pendingDeepLinkRef.current = null;
      navigate(url);
    }

    const sub = Linking.addEventListener("url", ({ url }) => {
      if (isAuthenticated && !isInitializing) {
        navigate(url);
      } else {
        pendingDeepLinkRef.current = url;
      }
    });

    return () => sub.remove();
  }, [isAuthenticated, isInitializing, navigate]);
}
