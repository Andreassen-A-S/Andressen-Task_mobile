import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  flag: "flag",
  calendar: "calendar",
  clock: "time",
  target: "locate",
  person: "person",
};

interface Props {
  icon: string;
  label: string;
  tint?: string;
  onPress: () => void;
}

export default function ToolbarGlassButton({ icon, label, tint, onPress }: Props) {
  const active = !!tint;
  const ionicon = (ICON_MAP[icon] ?? icon) as keyof typeof Ionicons.glyphMap;
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
        <Ionicons name={ionicon} size={13} color={active ? colors.white : colors.textSecondary} />
        <Text style={[typography.btnSm, { color: active ? colors.white : colors.textSecondary }]}>{label}</Text>
        {active && <Ionicons name="chevron-down" size={9} color={colors.white} />}
      </Pressable>
    </View>
  );
}
