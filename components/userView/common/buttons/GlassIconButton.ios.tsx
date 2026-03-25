import { Host, Image } from "@expo/ui/swift-ui";
import { glassEffect, padding, onTapGesture } from "@expo/ui/swift-ui/modifiers";
import type { SFSymbol } from "sf-symbols-typescript";

type Shape = "circle" | "capsule" | "rectangle" | "ellipse" | "roundedRectangle";
type Variant = "sm" | "lg";

const VARIANTS: Record<Variant, { size: number; paddingSize: number }> = {
  sm: { size: 16, paddingSize: 14 }, // 16 + 14*2 = 44px
  lg: { size: 18, paddingSize: 15 }, // 18 + 15*2 = 48px
};

interface Props {
  systemName: SFSymbol;
  onPress: () => void;
  variant?: Variant;
  shape?: Shape;
}

export default function GlassIconButton({
  systemName,
  onPress,
  variant = "sm",
  shape = "circle",
}: Props) {
  const { size, paddingSize } = VARIANTS[variant];
  return (
    <Host matchContents>
      <Image
        systemName={systemName}
        size={size}
        modifiers={[
          padding({ all: paddingSize }),
          glassEffect({ glass: { variant: "regular", interactive: true }, shape }),
          onTapGesture(onPress),
        ]}
      />
    </Host>
  );
}
