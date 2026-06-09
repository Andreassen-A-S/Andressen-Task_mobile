import { View, Platform } from "react-native";
import { ReactNode, useCallback, useState } from "react";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import ModalHeader from "./ModalHeader";

interface Props {
  title?: string;
  sub?: string;
  rightContent?: ReactNode;
  header?: ReactNode;
  headerStyle?: object;
  headerPointerEvents?: "none" | "box-none" | "box-only" | "auto";
  onClose?: () => void;
  children: ReactNode;
}

export function useModalHeaderHeight(hasSub = false): number {
  const insets = useSafeAreaInsets();
  const topSpacing = Platform.OS === "ios" ? 12 : insets.top;
  return topSpacing + (hasSub ? 68 : 56);
}

export function useCompactingModalHeader(headerHeight: number, compactHeight = 32) {
  const [isCompacted, setIsCompacted] = useState(false);
  const progress = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateY: -8 * progress.value }],
  }));

  const spacerStyle = useAnimatedStyle(() => ({
    height: headerHeight - (headerHeight - compactHeight) * progress.value,
  }), [headerHeight, compactHeight]);

  const handleFocusChange = useCallback((focused: boolean) => {
    setIsCompacted(focused);
    progress.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [progress]);

  return {
    headerStyle,
    headerPointerEvents: isCompacted ? "none" as const : undefined,
    spacerStyle,
    handleFocusChange,
  };
}

export default function ModalScreen({ title, sub, rightContent, header, headerStyle, headerPointerEvents, onClose, children }: Props) {
  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      {header ?? <ModalHeader title={title} sub={sub} rightContent={rightContent} onClose={onClose} style={headerStyle} pointerEvents={headerPointerEvents} />}
      {children}
    </View>
  );
}
