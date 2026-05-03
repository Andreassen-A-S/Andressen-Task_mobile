import { View, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

interface Props {
  placeholder?: string;
  onChangeText: (text: string) => void;
}

export default function NativeSearchBar({ placeholder = "Søg...", onChangeText }: Props) {
  const searchBarHeight = 8 + 56;

  return (
    <View style={{ height: searchBarHeight }}>
      <LinearGradient
        colors={[`${colors.eggWhite}00`, `${colors.eggWhite}CC`]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.white,
          borderRadius: 999,
          paddingHorizontal: 16,
          paddingVertical: 6,
          borderColor: colors.border,
          borderWidth: 1,
        }}>
          <Ionicons name="search" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            style={[typography.bodyMd, { flex: 1, color: colors.textPrimary }]}
          />
        </View>
      </View>
    </View>
  );
}
