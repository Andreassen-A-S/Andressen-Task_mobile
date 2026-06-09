import { View, TextInput } from "react-native";
import { Search } from "lucide-react-native";
import { colors } from "@/constants/colors";

interface Props {
  placeholder?: string;
  onChangeText: (text: string) => void;
  onFocusChange?: (focused: boolean) => void;
}

export default function NativeSearchBar({ placeholder = "Søg...", onChangeText, onFocusChange }: Props) {
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
          <Search size={16} color={colors.textMuted} style={{ marginRight: 8 }} strokeWidth={2.2} />
          <TextInput
            onChangeText={onChangeText}
            onFocus={() => onFocusChange?.(true)}
            onBlur={() => onFocusChange?.(false)}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            className="body-md flex-1"
          />
        </View>
      </View>
    </View>
  );
}
