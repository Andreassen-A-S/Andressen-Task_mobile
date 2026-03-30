import { useRef, useCallback } from "react";
import { useIsFocused } from "@react-navigation/native";
import { Host, Button, HStack, Image, Text } from "@expo/ui/swift-ui";
import { buttonStyle, glassEffect, padding, fixedSize, tint as t, font, foregroundStyle } from "@expo/ui/swift-ui/modifiers";

interface Props {
  icon: string;
  label: string;
  tint?: string;
  onPress: () => void;
}

export default function ToolbarGlassButton({ icon, label, tint, onPress }: Props) {
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
          padding({ horizontal: 10, vertical: 7 }),
          glassEffect({ glass: { variant: "regular", interactive: isFocused, tint }, shape: "capsule" }),
          ...(tint ? [t(tint)] : []),
        ]}
      >
        <HStack spacing={4} alignment="center">
          <Image systemName={icon} size={12} color={tint ? "white" : "gray"} />
          <Text modifiers={[font({ weight: "medium", size: 12 }), foregroundStyle(tint ? "white" : "secondary")]}>
            {label}
          </Text>
          {tint && <Image systemName="chevron.down" size={9} color="white" />}
        </HStack>
      </Button>
    </Host>
  );
}
