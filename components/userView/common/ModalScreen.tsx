import { View } from "react-native";
import { type ReactNode } from "react";
import { Stack } from "expo-router";
import ModalHeader from "./ModalHeader";
import { colors } from "@/constants/colors";

interface Props {
  title?: string;
  children: ReactNode;
}

export default function ModalScreen({ title, children }: Props) {
  return (
    <View className="flex-1" style={{ backgroundColor: colors.eggWhite }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ModalHeader title={title} />
      {children}
    </View>
  );
}
