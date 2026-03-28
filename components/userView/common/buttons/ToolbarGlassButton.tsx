import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tint?: string;
  onPress: () => void;
}

export default function ToolbarGlassButton({ icon, label, tint, onPress }: Props) {
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
        <Ionicons name={icon} size={13} color={active ? colors.white : colors.textSecondary} />
        <Text style={[typography.btnSm, { color: active ? colors.white : colors.textSecondary }]}>{label}</Text>
      </Pressable>
    </View>
  );
}
