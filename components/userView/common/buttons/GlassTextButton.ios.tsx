import { useRef, useCallback } from "react";
import { useIsFocused } from "@react-navigation/native";
import { Host, Button, Text } from "@expo/ui/swift-ui";
import { buttonStyle, glassEffect, padding, foregroundStyle, font, fixedSize, disabled } from "@expo/ui/swift-ui/modifiers";
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
  const isFocused = useIsFocused();
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;
  const handlePress = useCallback(() => onPressRef.current(), []);

  return (
    <Host matchContents>
      <Button
        onPress={handlePress}
        modifiers={[
          buttonStyle("plain"),
          fixedSize({ horizontal: true }),
          padding({ horizontal: 15, vertical: 13 }),
          glassEffect({ glass: { variant: "regular", interactive: isFocused && variant !== "inactive", tint }, shape: "capsule" }),
          ...(variant === "inactive" ? [disabled(true)] : []),
        ]}
      >
        <Text
          modifiers={[
            font({ weight: "bold", size: 14 }),
            ...(variant !== "default" ? [foregroundStyle(`${colors.white}99`)] : []),
          ]}
        >
          {label}
        </Text>
      </Button>
    </Host>
  );
}
