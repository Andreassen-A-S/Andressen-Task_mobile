import { View, Platform } from "react-native";
import { type ReactNode } from "react";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ModalHeader from "./ModalHeader";
import { colors } from "@/constants/colors";

interface Props {
  title?: string;
  sub?: string;
  rightContent?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
}

export function useModalHeaderHeight(hasSub = false): number {
  const insets = useSafeAreaInsets();
  const topSpacing = Platform.OS === "ios" ? 12 : insets.top;
  return topSpacing + (hasSub ? 68 : 56);
}

export default function ModalScreen({ title, sub, rightContent, header, children }: Props) {
  return (
    <View className="flex-1" style={{ backgroundColor: colors.eggWhite }}>
      <Stack.Screen options={{ headerShown: false }} />
      {header ?? <ModalHeader title={title} sub={sub} rightContent={rightContent} />}
      {children}
    </View>
  );
}
