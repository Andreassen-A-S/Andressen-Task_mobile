import { Host, Text } from "@expo/ui/swift-ui";
import { glassEffect, padding, onTapGesture, foregroundStyle, font } from "@expo/ui/swift-ui/modifiers";
import { colors } from "@/constants/colors";

type Variant = "default" | "active" | "inactive";

const TINTS: Record<Variant, string | undefined> = {
  default: undefined,
  active: "#007AFF",
  inactive: colors.textMuted,
};

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
}

export default function GlassTextButton({ label, onPress, variant = "default" }: Props) {
  const tint = TINTS[variant];
  return (
    <Host style={{ width: 71 }}>
      <Text
        modifiers={[
          ...(variant !== "default" ? [foregroundStyle(`${colors.white}99`)] : []),
          font({ weight: "bold" }),
          padding({ horizontal: 15, vertical: 13 }),
          glassEffect({ glass: { variant: "regular", interactive: variant !== "inactive", tint }, shape: "capsule" }),
          ...(variant !== "inactive" ? [onTapGesture(onPress)] : []),
        ]}
      >
        {label}
      </Text>
    </Host>
  );
}
