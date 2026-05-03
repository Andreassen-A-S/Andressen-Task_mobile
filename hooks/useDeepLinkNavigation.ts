import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { InteractionManager, Linking } from "react-native";
import { resolveDeepLink } from "@/lib/deepLinks";

interface UseDeepLinkNavigationOptions {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useDeepLinkNavigation({ isAuthenticated, isLoading }: UseDeepLinkNavigationOptions) {
  const router = useRouter();
  const hasHandledInitialUrlRef = useRef(false);
  const pendingDeepLinkRef = useRef<string | null>(null);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const isLoadingRef = useRef(isLoading);

  useEffect(() => { isAuthenticatedRef.current = isAuthenticated; });
  useEffect(() => { isLoadingRef.current = isLoading; });

  const navigate = useCallback((url: string) => {
    const link = resolveDeepLink(url);
    if (link?.screen === "task") {
      router.push(`/(tabs)/tasks/${link.taskId}`);
    }
  }, [router]);

  useEffect(() => {
    // Read the launch URL before auth is known; some platforms clear it after startup.
    if (!hasHandledInitialUrlRef.current) {
      hasHandledInitialUrlRef.current = true;
      Linking.getInitialURL()
        .then((url) => {
          if (!url) return;
          if (isAuthenticatedRef.current && !isLoadingRef.current) {
            InteractionManager.runAfterInteractions(() => navigate(url));
          } else {
            pendingDeepLinkRef.current = url;
          }
        })
        .catch((e) => {
          if (__DEV__) console.warn("getInitialURL failed", e);
        });
    }

    if (isAuthenticated && !isLoading && pendingDeepLinkRef.current) {
      const url = pendingDeepLinkRef.current;
      pendingDeepLinkRef.current = null;
      InteractionManager.runAfterInteractions(() => navigate(url));
    }

    const sub = Linking.addEventListener("url", ({ url }) => {
      if (isAuthenticated && !isLoading) {
        navigate(url);
      } else {
        pendingDeepLinkRef.current = url;
      }
    });

    return () => sub.remove();
  }, [isAuthenticated, isLoading, navigate]);
}
