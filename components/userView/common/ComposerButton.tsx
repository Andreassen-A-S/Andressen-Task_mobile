import { ActivityIndicator, TouchableOpacity } from "react-native";
import { ArrowUp, Plus, type LucideIcon } from "lucide-react-native";
import { colors } from "@/constants/colors";

const ICONS: Record<string, LucideIcon> = {
  add: Plus,
  "arrow-up": ArrowUp,
};

type ComposerButtonVariant = "primary" | "secondary" | "ghost";

interface Props {
  icon: string;
  onPress: () => void;
  disabled?: boolean;
  iconSize?: number;
  loading?: boolean;
  variant?: ComposerButtonVariant;
}

function getVariantStyle(variant: ComposerButtonVariant) {
  switch (variant) {
    case "primary":
      return { backgroundColor: colors.green, iconColor: colors.white };
    case "secondary":
      return { backgroundColor: colors.muted, iconColor: colors.textSecondary };
    case "ghost":
    default:
      return { backgroundColor: "transparent", iconColor: colors.textSecondary };
  }
}

export default function ComposerButton({
  icon,
  onPress,
  disabled = false,
  iconSize = 20,
  loading = false,
  variant = "ghost",
}: Props) {
  const Icon = ICONS[icon] ?? Plus;
  const { backgroundColor, iconColor } = getVariantStyle(variant);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="w-10 h-10 rounded-full items-center justify-center"
      style={{ backgroundColor, opacity: disabled ? 0.4 : 1 }}
    >
      {loading
        ? <ActivityIndicator color={iconColor} size="small" />
        : <Icon size={iconSize} color={iconColor} strokeWidth={2.3} />
      }
    </TouchableOpacity>
  );
}
