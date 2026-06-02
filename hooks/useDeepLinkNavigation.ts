import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Linking } from "react-native";
import { resolveDeepLink } from "@/lib/deepLinks";
import { runAfterNavigationFrame } from "@/lib/navigationTiming";

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

  useEffect(() => { isAuthenticatedRef.current = isAuthenticated; });
  useEffect(() => { isInitializingRef.current = isInitializing; });

  const navigate = useCallback((url: string) => {
    const link = resolveDeepLink(url);
    if (link?.screen === "task") {
      const hadOpenModal = router.canDismiss();
      if (hadOpenModal) router.dismissAll();
      setTimeout(() => {
        router.dismissTo("/(tabs)/tasks");
        setTimeout(() => {
          runAfterNavigationFrame(() => {
            router.push({
              pathname: "/(tabs)/tasks/[taskId]",
              params: { taskId: link.taskId },
            });
          });
        }, 220);
      }, hadOpenModal ? 450 : 0);
    }
  }, [router]);

  useEffect(() => {
    // Read the launch URL before auth is known; some platforms clear it after startup.
    if (!hasHandledInitialUrlRef.current) {
      hasHandledInitialUrlRef.current = true;
      Linking.getInitialURL()
        .then((url) => {
          if (!url) return;
          if (isAuthenticatedRef.current && !isInitializingRef.current) {
            runAfterNavigationFrame(() => navigate(url));
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
      runAfterNavigationFrame(() => navigate(url));
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
