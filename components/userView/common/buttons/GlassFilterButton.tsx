import { View, Text, Pressable } from "react-native";
import { ChevronDown, type LucideIcon } from "lucide-react-native";
import { colors } from "@/constants/colors";

interface Props {
  icon?: LucideIcon;
  label: string;
  variant: "regular" | "active";
  count?: number;
  onPress: () => void;
}

export default function GlassFilterButton({ icon: Icon, label, variant, count, onPress }: Props) {
  const isMulti = variant === "active" && count !== undefined && count > 1;
  const active = variant === "active";

  return (
    <View style={{
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: isMulti ? "#EBF3FF" : active ? "#007AFF" : colors.white,
      borderWidth: isMulti ? 1 : active ? 0 : 1,
      borderColor: isMulti ? "#007AFF40" : colors.border,
    }}>
      <Pressable
        onPress={onPress}
        android_ripple={{ color: colors.border, borderless: false }}
        className="flex-row items-center gap-1.5 px-[10] py-[7]"
      >
        {isMulti ? (
          <View className="w-5 h-5 rounded-full bg-[#007AFF] items-center justify-center">
            <Text className="btn-sm text-white">{count}</Text>
          </View>
        ) : active && Icon ? (
          <Icon size={13} color={colors.white} strokeWidth={2.2} />
        ) : null}
        <Text className="btn-sm" style={{ color: isMulti ? "#007AFF" : active ? colors.white : colors.textSecondary }}>{label}</Text>
        <ChevronDown size={9} color={isMulti ? "#007AFF" : active ? colors.white : colors.textSecondary} strokeWidth={3} />
      </Pressable>
    </View>
  );
}
