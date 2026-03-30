import { useIsFocused } from "@react-navigation/native";
import { Host, Image, HStack } from "@expo/ui/swift-ui";
import { glassEffect, padding, onTapGesture } from "@expo/ui/swift-ui/modifiers";
import type { SFSymbol } from "sf-symbols-typescript";

type Variant = "sm" | "lg";

const VARIANTS: Record<Variant, { size: number; paddingSize: number }> = {
  sm: { size: 16, paddingSize: 10 }, // 16 + 14*2 = 44px
  lg: { size: 18, paddingSize: 11 }, // 18 + 15*2 = 48px
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
  const isFocused = useIsFocused();
  return (
    <Host matchContents>
      <HStack
        spacing={0}
        modifiers={[glassEffect({ glass: { variant: "regular", interactive: isFocused }, shape: "capsule" })]}
      >
        {items.map((item, index) => (
          <Image
            key={index}
            systemName={item.systemName}
            size={size}
            modifiers={[
              padding({ vertical: paddingSize, horizontal: paddingSize + (index === 0 ? 4 : 0) }), // Extra horizontal padding for the first item to balance the capsule shape
              onTapGesture(item.onPress),
            ]}
          />
        ))}
      </HStack>
    </Host>
  );
}
