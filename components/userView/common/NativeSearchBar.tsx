import { View, TextInput } from "react-native";
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
    <View style={{ height: searchBarHeight, justifyContent: "flex-end", paddingBottom: 8 }}>
      <View style={{ paddingHorizontal: 16 }}>
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
