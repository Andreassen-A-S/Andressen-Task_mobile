import { View, Pressable } from "react-native";
import { type LucideIcon } from "lucide-react-native";
import { colors } from "@/constants/colors";

type Size = "sm" | "lg";
type Variant = "default" | "active" | "inactive";

const SIZES: Record<Size, { size: number; hitSize: number }> = {
  sm: { size: 20, hitSize: 44 },
  lg: { size: 28, hitSize: 48 },
};

const VARIANT_STYLES: Record<Variant, { bg: string; border: string; iconColor: string }> = {
  default: { bg: colors.surface, border: colors.border, iconColor: colors.textPrimary },
  active:  { bg: "#007AFF", border: "#007AFF", iconColor: colors.white },
  inactive:{ bg: colors.textMuted, border: colors.textMuted, iconColor: colors.white },
};

interface Props {
  icon: LucideIcon;
  onPress: () => void;
  size?: Size;
  variant?: Variant;
  onDark?: boolean;
}

export default function GlassIconButton({ icon: Icon, onPress, size = "sm", variant = "default" }: Props) {
  const { size: iconSize, hitSize } = SIZES[size];
  const { bg, border, iconColor } = VARIANT_STYLES[variant];

  return (
    <View style={{
      width: hitSize,
      height: hitSize,
      borderRadius: hitSize / 2,
      backgroundColor: bg,
      borderWidth: 1,
      borderColor: border,
      overflow: "hidden",
    }}>
      <Pressable
        onPress={onPress}
        disabled={variant === "inactive"}
        android_ripple={{ color: colors.border, borderless: false }}
        className="flex-1 items-center justify-center"
      >
        <Icon size={iconSize} color={iconColor} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}
