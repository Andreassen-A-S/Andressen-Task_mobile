import { View, Text } from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { typography } from "@/constants/typography";
import TaskDetailsHeader from "./TaskDetailsHeader";

interface Props {
  taskId: string;
}

export default function TaskFiles({ taskId }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#F6F5F1]">
      <Stack.Screen options={{ headerShown: false }} />
      <TaskDetailsHeader title="Filer" />
      <View className="flex-1 items-center justify-center" style={{ paddingTop: insets.top + 56 }}>
        <Text style={typography.bodySm} className="text-gray-400">Filer kommer snart</Text>
      </View>
    </View>
  );
}
