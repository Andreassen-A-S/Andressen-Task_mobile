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
    <View style={{ height: searchBarHeight }} className="justify-end pb-2">
      <View className="px-4">
        <View className="flex-row items-center bg-surface rounded-full px-4 py-1.5 border border-border">
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
