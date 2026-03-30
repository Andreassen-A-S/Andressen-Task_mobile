import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SFSymbol } from "sf-symbols-typescript";
import { colors } from "@/constants/colors";

type Size = "sm" | "lg";
type Variant = "default" | "active" | "inactive";

const SIZES: Record<Size, { size: number; hitSize: number }> = {
  sm: { size: 16, hitSize: 44 },
  lg: { size: 18, hitSize: 48 },
};

const VARIANT_STYLES: Record<Variant, { bg: string; border: string; iconColor: string }> = {
  default: { bg: colors.surface, border: colors.border, iconColor: colors.textPrimary },
  active:  { bg: "#007AFF", border: "#007AFF", iconColor: colors.white },
  inactive:{ bg: colors.textMuted, border: colors.textMuted, iconColor: colors.white },
};

const SF_TO_IONICON: Partial<Record<SFSymbol, keyof typeof Ionicons.glyphMap>> = {
  "xmark": "close",
  "chevron.left": "chevron-back",
  "camera": "camera",
  "bubble.right": "chatbubble",
  "folder": "folder",
  "square.and.arrow.up": "share-social",
  "ellipsis": "ellipsis-horizontal",
  "magnifyingglass": "search",
  "plus": "add",
  "checkmark": "checkmark",
};

interface Props {
  systemName: SFSymbol;
  onPress: () => void;
  size?: Size;
  variant?: Variant;
}

export default function GlassIconButton({ systemName, onPress, size = "sm", variant = "default" }: Props) {
  const { size: iconSize, hitSize } = SIZES[size];
  const { bg, border, iconColor } = VARIANT_STYLES[variant];
  const iconName = SF_TO_IONICON[systemName] ?? "ellipsis-horizontal";

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
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Ionicons name={iconName} size={iconSize} color={iconColor} />
      </Pressable>
    </View>
  );
}
