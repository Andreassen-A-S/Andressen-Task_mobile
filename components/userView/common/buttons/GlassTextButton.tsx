import { View, Pressable, Text } from "react-native";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

type Variant = "default" | "active" | "inactive";

const VARIANT_STYLES: Record<Variant, { container: object; text: object }> = {
  default: {
    container: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    text: {},
  },
  active: {
    container: { backgroundColor: "#007AFF" },
    text: { color: colors.white },
  },
  inactive: {
    container: { backgroundColor: colors.textMuted },
    text: { color: colors.white },
  },
};

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
}

export default function GlassTextButton({ label, onPress, variant = "default" }: Props) {
  const styles = VARIANT_STYLES[variant];
  return (
    <View className="rounded-3xl" style={{ overflow: "hidden", ...styles.container }}>
      <Pressable
        onPress={onPress}
        disabled={variant === "inactive"}
        android_ripple={{ color: colors.border, borderless: false }}
        style={{ height: 48, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={[typography.btnLg, styles.text]}>{label}</Text>
      </Pressable>
    </View>
  );
}
