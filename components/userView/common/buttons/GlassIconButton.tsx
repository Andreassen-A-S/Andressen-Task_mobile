import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SFSymbol } from "sf-symbols-typescript";
import { colors } from "@/constants/colors";

type Variant = "sm" | "lg";

const VARIANTS: Record<Variant, { size: number; hitSize: number }> = {
  sm: { size: 16, hitSize: 44 },
  lg: { size: 18, hitSize: 48 },
};

const SF_TO_IONICON: Partial<Record<SFSymbol, keyof typeof Ionicons.glyphMap>> = {
  "xmark": "close",
  "chevron.left": "chevron-back",
  "camera": "camera",
  "bubble.right": "chatbubble",
  "folder": "folder",
  "square.and.arrow.up": "share-social",
  "ellipsis": "ellipsis-horizontal",
};

interface Props {
  systemName: SFSymbol;
  onPress: () => void;
  variant?: Variant;
}

export default function GlassIconButton({ systemName, onPress, variant = "sm" }: Props) {
  const { size, hitSize } = VARIANTS[variant];
  const iconName = SF_TO_IONICON[systemName] ?? "ellipsis-horizontal";

  return (
    <View style={{
      width: hitSize,
      height: hitSize,
      borderRadius: hitSize / 2,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    }}>
      <Pressable
        onPress={onPress}
        android_ripple={{ color: colors.border, borderless: false }}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Ionicons name={iconName} size={size} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}
