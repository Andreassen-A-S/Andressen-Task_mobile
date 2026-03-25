import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SFSymbol } from "sf-symbols-typescript";
import { colors } from "@/constants/colors";

type Variant = "sm" | "lg";

const VARIANTS: Record<Variant, { size: number; paddingSize: number }> = {
  sm: { size: 16, paddingSize: 10 },
  lg: { size: 18, paddingSize: 11 },
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

interface PillItem {
  systemName: SFSymbol;
  onPress: () => void;
}

interface Props {
  items: PillItem[];
  variant?: Variant;
}

export default function GlassPillButton({ items, variant = "sm" }: Props) {
  const { size, paddingSize } = VARIANTS[variant];

  return (
    <View style={{
      flexDirection: "row",
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    }}>
      {items.map((item, index) => {
        const iconName = SF_TO_IONICON[item.systemName] ?? "ellipsis-horizontal";
        return (
          <Pressable
            key={index}
            onPress={item.onPress}
            android_ripple={{ color: colors.border, borderless: false }}
            style={{
              paddingVertical: paddingSize,
              paddingHorizontal: paddingSize + 4,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name={iconName} size={size} color={colors.textPrimary} />
          </Pressable>
        );
      })}
    </View>
  );
}
