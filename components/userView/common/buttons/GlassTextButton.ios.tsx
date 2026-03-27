import { Host, Text } from "@expo/ui/swift-ui";
import { glassEffect, padding, onTapGesture, foregroundStyle } from "@expo/ui/swift-ui/modifiers";

interface Props {
  label: string;
  onPress: () => void;
}

export default function GlassTextButton({ label, onPress }: Props) {
  return (
    <Host style={{ width: 80, height: 48 }}>
      <Text
        modifiers={[
          // foregroundStyle("#1B1D44"),
          padding({ horizontal: 15, vertical: 13 }),
          glassEffect({ glass: { variant: "clear", interactive: true }, shape: "capsule" }),
          onTapGesture(onPress),
        ]}
      >
        {label}
      </Text>
    </Host>
  );
}
