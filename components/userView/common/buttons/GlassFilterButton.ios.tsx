import { useRef, useCallback } from "react";
import { useIsFocused } from "@react-navigation/native";
import { Host, Button, HStack, Image, Text } from "@expo/ui/swift-ui";
import { buttonStyle, glassEffect, padding, fixedSize, tint as t, font, foregroundStyle, frame, background, clipShape } from "@expo/ui/swift-ui/modifiers";

interface Props {
  icon: string;
  label: string;
  variant: "regular" | "active";
  count?: number;
  onPress: () => void;
}

export default function GlassFilterButton({ icon, label, variant, count, onPress }: Props) {
  const isFocused = useIsFocused();
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;
  const handlePress = useCallback(() => onPressRef.current(), []);

  const isActive = variant === "active";
  const isMulti = isActive && count !== undefined && count > 1;

  return (
    <Host matchContents>
      <Button
        onPress={handlePress}
        modifiers={[
          buttonStyle("plain"),
          fixedSize({ horizontal: true }),
          padding({ horizontal: 10, vertical: 7 }),
          isMulti
            ? glassEffect({ glass: { variant: "regular", interactive: isFocused, tint: "#007AFF20" }, shape: "capsule" })
            : glassEffect({ glass: { variant: "regular", interactive: isFocused, tint: isActive ? "#007AFF20" : undefined }, shape: "capsule" }),
          ...(isActive ? [t("#007AFF")] : []),
        ]}
      >
        <HStack spacing={6} alignment="center">
          {isMulti ? (
            <Text modifiers={[
              font({ weight: "bold", size: 11 }),
              foregroundStyle("white"),
              frame({ width: 15, height: 15 }),
              background("#007AFF"),
              clipShape("circle"),
            ]}>
              {String(count)}
            </Text>
          ) : isActive ? (
            <Image systemName={icon} size={12} color={isActive ? "#007AFF" : "gray"} />
          ) : null}
          <Text modifiers={[font({ weight: "medium", size: 12 }), foregroundStyle(isActive ? "#007AFF" : "secondary")]}>
            {label}
          </Text>
          <Image systemName="chevron.down" size={9} color={isActive ? "#007AFF" : "gray"} />
        </HStack>
      </Button>
    </Host>
  );
}
