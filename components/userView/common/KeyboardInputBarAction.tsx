import { TouchableOpacity, ActivityIndicator } from "react-native";
import { ArrowUp, Plus, type LucideIcon } from "lucide-react-native";
import { colors } from "@/constants/colors";

const ICONS: Record<string, LucideIcon> = {
  "add": Plus,
  "arrow-up": ArrowUp,
};

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
  const Icon = ICONS[icon] ?? Plus;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="w-9 h-9 rounded-full items-center justify-center"
      style={{ backgroundColor, opacity: disabled ? 0.4 : 1 }}
    >
      {loading
        ? <ActivityIndicator color={colors.white} size="small" />
        : <Icon size={iconSize} color={iconColor} strokeWidth={2.3} />
      }
    </TouchableOpacity>
  );
}
