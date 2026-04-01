import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

interface Props {
  count: number;
  onPress: () => void;
}

export default function ClearFiltersButton({ count, onPress }: Props) {
  return (
    <View style={{ borderRadius: 999, overflow: "hidden", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }}>
      <Pressable
        onPress={onPress}
        android_ripple={{ color: colors.border, borderless: false }}
        style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7 }}
      >
        <Ionicons name="filter" size={13} color={colors.textSecondary} />
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#007AFF", alignItems: "center", justifyContent: "center" }}>
          <Text style={[typography.btnSm, { color: colors.white, fontSize: 11 }]}>{count}</Text>
        </View>
      </Pressable>
    </View>
  );
}
