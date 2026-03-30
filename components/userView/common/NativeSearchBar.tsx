import { View, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

interface Props {
  placeholder?: string;
  onChangeText: (text: string) => void;
}

export default function NativeSearchBar({ placeholder = "Søg...", onChangeText }: Props) {
  const insets = useSafeAreaInsets();
  const searchBarHeight = 8 + 56 + insets.bottom;

  return (
    <>
      <LinearGradient
        colors={[`${colors.eggWhite}00`, `${colors.eggWhite}CC`]}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: searchBarHeight }}
      />
      <View style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: insets.bottom,
      }}>
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
    </>
  );
}
