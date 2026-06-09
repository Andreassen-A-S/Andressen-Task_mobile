import { useRef, useCallback } from "react";
import { View } from "react-native";
import { useIsFocused } from "expo-router/react-navigation";
import { Host, RNHostView, ZStack } from "@expo/ui/swift-ui";
import { glassEffect, frame, onTapGesture, contentShape, shapes, disabled } from "@expo/ui/swift-ui/modifiers";
import { type LucideIcon } from "lucide-react-native";
import { colors } from "@/constants/colors";

type Size = "sm" | "lg";
type Variant = "default" | "active" | "inactive";
const SIZES: Record<Size, { iconSize: number; buttonSize: number }> = {
  sm: { iconSize: 20, buttonSize: 44 },
  lg: { iconSize: 28, buttonSize: 48 },
};

const TINTS: Record<Variant, string | undefined> = {
  default: undefined,
  active: "#007AFF",
  inactive: colors.textMuted,
};

interface Props {
  icon: LucideIcon;
  onPress: () => void;
  size?: Size;
  variant?: Variant;
  onDark?: boolean;
}

export default function GlassIconButton({
  icon: Icon,
  onPress,
  size = "sm",
  variant = "default",
  onDark = false,
}: Props) {
  const { iconSize, buttonSize } = SIZES[size];
  const tint = variant !== "default" ? TINTS[variant] : onDark ? "#191919" : undefined;
  const iconColor = variant === "inactive" ? colors.textMuted : variant === "active" || onDark ? colors.white : colors.textPrimary;
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
        <RNHostView matchContents>
          <View pointerEvents="none" style={{ width: iconSize, height: iconSize, alignItems: "center", justifyContent: "center" }}>
            <Icon size={iconSize} color={iconColor} strokeWidth={1.6} />
          </View>
        </RNHostView>
      </ZStack>
    </Host>
  );
}
