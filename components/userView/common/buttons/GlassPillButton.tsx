import { View, Pressable, Alert } from "react-native";
import { Ellipsis } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { PillItem } from "@/types/pill";

type Variant = "sm" | "lg";

const VARIANTS: Record<Variant, { size: number; paddingSize: number }> = {
  sm: { size: 20, paddingSize: 12 },
  lg: { size: 24, paddingSize: 12 },
};


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
        const Icon = item.icon ?? Ellipsis;
        const enabledActions = item.menuActions?.filter((a) => !a.disabled) ?? [];
        const handlePress = enabledActions.length
          ? () => Alert.alert(
              "",
              undefined,
              [
                ...enabledActions.map((a) => ({
                  text: a.label,
                  onPress: a.onPress,
                  style: a.role === "destructive" ? ("destructive" as const) : ("default" as const),
                })),
                { text: "Annuller", style: "cancel" as const },
              ]
            )
          : item.onPress;

        return (
          <Pressable
            key={index}
            onPress={handlePress}
            android_ripple={{ color: colors.border, borderless: false }}
            style={{
              paddingVertical: paddingSize,
              paddingHorizontal: paddingSize + 4,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={size} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>
        );
      })}
    </View>
  );
}
