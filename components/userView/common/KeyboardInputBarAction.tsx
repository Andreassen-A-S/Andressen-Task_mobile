import { TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";

interface Props {
  icon: string;
  onPress: () => void;
  disabled?: boolean;
  backgroundColor?: string;
  iconColor?: string;
  iconSize?: number;
  loading?: boolean;
}

export default function KeyboardInputBarAction({
  icon,
  onPress,
  disabled = false,
  backgroundColor = "transparent",
  iconColor = colors.textSecondary,
  iconSize = 18,
  loading = false,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{ width: 36, height: 36, borderRadius: 24, backgroundColor, opacity: disabled ? 0.4 : 1, alignItems: "center", justifyContent: "center" }}
    >
      {loading
        ? <ActivityIndicator color={colors.white} size="small" />
        : <Ionicons name={icon as any} size={iconSize} color={iconColor} />
      }
    </TouchableOpacity>
  );
}
