import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  flag: "flag",
  folder: "folder-outline",
  person: "person",
  "person.badge.plus": "person-add-outline",
};

interface Props {
  icon?: string;
  label: string;
  variant: "regular" | "active";
  count?: number;
  onPress: () => void;
}

export default function GlassFilterButton({ icon, label, variant, count, onPress }: Props) {
  const isMulti = variant === "active" && count !== undefined && count > 1;
  const active = variant === "active";
  const ionicon = (ICON_MAP[icon] ?? icon) as keyof typeof Ionicons.glyphMap;

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
        style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7 }}
      >
        {isMulti ? (
          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#007AFF", alignItems: "center", justifyContent: "center" }}>
            <Text style={[typography.btnSm, { color: colors.white, fontSize: 11 }]}>{count}</Text>
          </View>
        ) : active && icon ? (
          <Ionicons name={ionicon} size={13} color={colors.white} />
        ) : null}
        <Text style={[typography.btnSm, { color: isMulti ? "#007AFF" : active ? colors.white : colors.textSecondary }]}>{label}</Text>
        <Ionicons name="chevron-down" size={9} color={isMulti ? "#007AFF" : active ? colors.white : colors.textSecondary} />
      </Pressable>
    </View>
  );
}
