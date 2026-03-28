import { Host, HStack, Image, Text, GlassEffectContainer } from "@expo/ui/swift-ui";
import { glassEffect, padding, onTapGesture, foregroundStyle, font, fixedSize } from "@expo/ui/swift-ui/modifiers";
import type { SFSymbol } from "sf-symbols-typescript";

interface Props {
  icon: SFSymbol;
  label: string;
  tint?: string;
  onPress: () => void;
}

export default function ToolbarGlassButton({ icon, label, tint, onPress }: Props) {
  return (
    <Host matchContents style={{ height: 34 }}>
      <GlassEffectContainer spacing={0} modifiers={[fixedSize({ horizontal: true })]}>
        <HStack
          spacing={4}
          alignment="center"
          modifiers={[
            padding({ horizontal: 10, vertical: 8 }),
            glassEffect({ glass: { variant: "regular", interactive: true, tint }, shape: "capsule" }),
            onTapGesture(onPress),
          ]}
        >
        <Image
          systemName={icon}
          size={13}
          color={tint ? "white" : "gray"}
        />
        <Text
          modifiers={[
            font({ weight: "medium", size: 12 }),
            foregroundStyle(tint ? "white" : "secondary"),
          ]}
        >
          {label}
        </Text>
        {tint && (
          <Image
            systemName="chevron.down"
            size={9}
            color="white"
          />
        )}
        </HStack>
      </GlassEffectContainer>
    </Host>
  );
}
