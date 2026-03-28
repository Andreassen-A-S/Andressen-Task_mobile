import { Host, Image } from "@expo/ui/swift-ui";
import { glassEffect, padding, onTapGesture } from "@expo/ui/swift-ui/modifiers";
import type { SFSymbol } from "sf-symbols-typescript";
import { colors } from "@/constants/colors";

type Size = "sm" | "lg";
type Variant = "default" | "active" | "inactive";
type Shape = "circle" | "capsule" | "rectangle" | "ellipse" | "roundedRectangle";

const SIZES: Record<Size, { size: number; paddingSize: number }> = {
  sm: { size: 16, paddingSize: 14 },
  lg: { size: 18, paddingSize: 15 },
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
  shape?: Shape;
}

export default function GlassIconButton({
  systemName,
  onPress,
  size = "sm",
  variant = "default",
  shape = "circle",
}: Props) {
  const { size: iconSize, paddingSize } = SIZES[size];
  const tint = TINTS[variant];
  const interactive = variant !== "inactive";
  return (
    <Host matchContents>
      <Image
        systemName={systemName}
        size={iconSize}
        color={variant === "active" ? `${colors.white}99` : undefined}
        modifiers={[
          padding({ all: paddingSize }),
          glassEffect({ glass: { variant: "regular", interactive, tint }, shape }),
          ...(interactive ? [onTapGesture(onPress)] : []),
        ]}
      />
    </Host>
  );
}
