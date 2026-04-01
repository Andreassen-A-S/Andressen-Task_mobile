import { useRef, useCallback } from "react";
import { useIsFocused } from "@react-navigation/native";
import { Host, Button, HStack, Image, Text } from "@expo/ui/swift-ui";
import { buttonStyle, glassEffect, padding, fixedSize, font, foregroundStyle, frame, background, clipShape } from "@expo/ui/swift-ui/modifiers";

interface Props {
  count: number;
  onPress: () => void;
}

export default function ClearFiltersButton({ count, onPress }: Props) {
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
          glassEffect({ glass: { variant: "regular", interactive: isFocused }, shape: "capsule" }),
        ]}
      >
        <HStack spacing={6} alignment="center">
          <Image systemName="line.3.horizontal.decrease" size={12} color="secondary" />
          <Text modifiers={[
            font({ weight: "bold", size: 11 }),
            foregroundStyle("white"),
            frame({ width: 15, height: 15 }),
            background("#007AFF"),
            clipShape("circle"),
          ]}>
            {String(count)}
          </Text>
        </HStack>
      </Button>
    </Host>
  );
}
