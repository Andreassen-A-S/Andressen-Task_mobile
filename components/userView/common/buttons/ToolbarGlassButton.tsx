import { View, Text, Pressable } from "react-native";
import { ChevronDown, type LucideIcon } from "lucide-react-native";
import { colors } from "@/constants/colors";

interface Props {
  icon: LucideIcon;
  label: string;
  tint?: string;
  onPress: () => void;
}

export default function ToolbarGlassButton({ icon: Icon, label, tint, onPress }: Props) {
  const active = !!tint;
  return (
    <View style={{
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: active ? tint : colors.white,
      borderWidth: active ? 0 : 1,
      borderColor: colors.border,
    }}>
      <Pressable
        onPress={onPress}
        android_ripple={{ color: colors.border, borderless: false }}
        style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8 }}
      >
        <Icon size={13} color={active ? colors.white : colors.textSecondary} strokeWidth={2.2} />
        <Text className="btn-sm" style={{ color: active ? colors.white : colors.textSecondary }}>{label}</Text>
        {active && <ChevronDown size={9} color={colors.white} strokeWidth={3} />}
      </Pressable>
    </View>
  );
}
