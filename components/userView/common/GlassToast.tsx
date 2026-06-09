import { Pressable, Text, View } from "react-native";
import { TriangleAlert, X } from "lucide-react-native";

interface Props {
  title: string;
  message: string;
  onDismiss: () => void;
}

export function GlassToast({ title, message, onDismiss }: Props) {
  return (
    <View className="bg-white rounded-2xl p-4 flex-row items-center gap-3" style={{ elevation: 5 }}>
      <TriangleAlert size={22} color="orange" strokeWidth={2.2} />
      <View className="flex-1">
        <Text className="btn-lg text-charcoal">{title}</Text>
        <Text className="body-xs mt-0.5">{message}</Text>
      </View>
      <Pressable onPress={onDismiss} hitSlop={8}>
        <X size={18} color="#9CA3AF" strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}
