import { View } from "react-native";
import { Stack } from "expo-router";
import ModalHeader from "./ModalHeader";

interface Props {
  title?: string;
  children: React.ReactNode;
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
