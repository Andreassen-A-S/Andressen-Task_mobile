import { View } from "react-native";
import { type ReactNode } from "react";
import { Stack } from "expo-router";
import ModalHeader from "./ModalHeader";

interface Props {
  title?: string;
  children: ReactNode;
}

export default function ModalScreen({ title, children }: Props) {
  return (
    <View className="flex-1 bg-[#F6F5F1]">
      <Stack.Screen options={{ headerShown: false }} />
      <ModalHeader title={title} />
      {children}
    </View>
  );
}
