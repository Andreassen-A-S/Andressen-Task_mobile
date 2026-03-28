import { useRef } from "react";
import { Host, VStack, HStack, Text } from "@expo/ui/swift-ui";
import { glassEffect, padding, onTapGesture, foregroundStyle, font, fixedSize } from "@expo/ui/swift-ui/modifiers";
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
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;
  return (
    <Host matchContents>
      <HStack
        modifiers={[
          fixedSize({ horizontal: true }),
          padding({ horizontal: 15, vertical: 13 }),
          glassEffect({ glass: { variant: "regular", interactive: true, tint }, shape: "capsule" }),
          onTapGesture(() => onPressRef.current()),
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
      </HStack>
    </Host>
  );
}
