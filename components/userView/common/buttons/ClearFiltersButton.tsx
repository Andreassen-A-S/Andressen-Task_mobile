import { View, Text, Pressable } from "react-native";
import { ListFilter } from "lucide-react-native";
import { colors } from "@/constants/colors";

interface Props {
  count: number;
  onPress: () => void;
}

export default function ClearFiltersButton({ count, onPress }: Props) {
  return (
    <View className="rounded-full overflow-hidden bg-white border border-border">
      <Pressable
        onPress={onPress}
        android_ripple={{ color: colors.border, borderless: false }}
        className="flex-row items-center gap-1.5 px-2.5 py-[7px]"
      >
        <ListFilter size={13} color={colors.textSecondary} strokeWidth={2.2} />
        <View className="w-5 h-5 rounded-full bg-[#007AFF] items-center justify-center">
          <Text className="btn-sm text-white">{count}</Text>
        </View>
      </Pressable>
    </View>
  );
}
