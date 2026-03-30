import { useRef, useCallback } from "react";
import { useIsFocused } from "@react-navigation/native";
import { Host, ZStack, Image } from "@expo/ui/swift-ui";
import { glassEffect, frame, onTapGesture, contentShape, shapes, disabled } from "@expo/ui/swift-ui/modifiers";
import type { SFSymbol } from "sf-symbols-typescript";
import { colors } from "@/constants/colors";

type Size = "sm" | "lg";
type Variant = "default" | "active" | "inactive";
const SIZES: Record<Size, { iconSize: number; buttonSize: number }> = {
  sm: { iconSize: 16, buttonSize: 44 },
  lg: { iconSize: 18, buttonSize: 48 },
};

const TINTS: Record<Variant, string | undefined> = {
  default: undefined,
  active: "#007AFF",
  inactive: colors.textMuted,
};

interface Props {
  systemName: SFSymbol;
  onPress: () => void;
  size?: Size;
  variant?: Variant;
}

export default function GlassIconButton({
  systemName,
  onPress,
  size = "sm",
  variant = "default",
}: Props) {
  const { iconSize, buttonSize } = SIZES[size];
  const tint = TINTS[variant];
  const isFocused = useIsFocused();
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;
  const handlePress = useCallback(() => onPressRef.current(), []);

  return (
    <Host matchContents>
      <ZStack
        modifiers={[
          frame({ width: buttonSize, height: buttonSize }),
          glassEffect({ glass: { variant: "regular", interactive: isFocused && variant !== "inactive", tint }, shape: "circle" }),
          contentShape(shapes.circle()),
          ...(variant !== "inactive" ? [onTapGesture(handlePress)] : [disabled(true)]),
        ]}
      >
        <Image systemName={systemName} size={iconSize} color={variant === "active" ? `${colors.white}99` : tint} />
      </ZStack>
    </Host>
  );
}
