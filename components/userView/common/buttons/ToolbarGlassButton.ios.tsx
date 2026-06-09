import { useRef, useCallback } from "react";
import { View, Text } from "react-native";
import { useIsFocused } from "expo-router/react-navigation";
import { Host, ZStack, RNHostView } from "@expo/ui/swift-ui";
import { glassEffect, fixedSize, contentShape, shapes, onTapGesture } from "@expo/ui/swift-ui/modifiers";
import { ChevronDown, type LucideIcon } from "lucide-react-native";
import { colors } from "@/constants/colors";

interface Props {
  icon: LucideIcon;
  label: string;
  tint?: string;
  onPress: () => void;
}

export default function ToolbarGlassButton({ icon: Icon, label, tint, onPress }: Props) {
  const isFocused = useIsFocused();
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;
  const handlePress = useCallback(() => onPressRef.current(), []);

  return (
    <Host key={label} matchContents>
      <ZStack
        modifiers={[
          fixedSize({ horizontal: true }),
          glassEffect({ glass: { variant: "regular", interactive: isFocused, tint }, shape: "capsule" }),
          contentShape(shapes.capsule()),
          onTapGesture(handlePress),
        ]}
      >
        <RNHostView matchContents>
          <View
            pointerEvents="none"
            style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingLeft: 10, paddingRight: 8, paddingVertical: 7 }}
          >
            <Icon style={{ marginLeft: -2 }} size={16} color={tint ? "white" : colors.textMuted} strokeWidth={2.4} />
            <Text className="font-semibold" style={{ fontSize: 12, color: tint ? "white" : colors.textPrimary }}>{label}</Text>
            {tint && <ChevronDown style={{ marginRight: -1 }} size={16} color="white" strokeWidth={2.4} />}
          </View>
        </RNHostView>
      </ZStack>
    </Host>
  );
}
