import { useRef, useCallback } from "react";
import { View, Text } from "react-native";
import { useIsFocused } from "expo-router/react-navigation";
import { Host, ZStack, RNHostView } from "@expo/ui/swift-ui";
import { glassEffect, fixedSize, contentShape, shapes, onTapGesture } from "@expo/ui/swift-ui/modifiers";
import { ChevronDown, type LucideIcon } from "lucide-react-native";
import { colors } from "@/constants/colors";

interface Props {
  icon?: LucideIcon;
  label: string;
  variant: "regular" | "active";
  count?: number;
  onPress: () => void;
}

export default function GlassFilterButton({ icon: Icon, label, variant, count, onPress }: Props) {
  const isFocused = useIsFocused();
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;
  const handlePress = useCallback(() => onPressRef.current(), []);

  const isActive = variant === "active";
  const isMulti = isActive && count !== undefined && count > 1;

  return (
    <Host key={`${label}-${count ?? 0}`} matchContents>
      <ZStack
        modifiers={[
          fixedSize({ horizontal: true }),
          glassEffect({ glass: { variant: "regular", interactive: isFocused, tint: isActive ? "#007AFF20" : undefined }, shape: "capsule" }),
          contentShape(shapes.capsule()),
          onTapGesture(handlePress),
        ]}
      >
        <RNHostView matchContents>
          <View
            pointerEvents="none"
            style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingLeft: 10, paddingRight: 8, paddingVertical: 7 }}
          >
            {isMulti ? (
              <View style={{ width: 15, height: 15, borderRadius: 7.5, backgroundColor: "#007AFF", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "white", fontSize: 11, fontWeight: "bold", lineHeight: 15 }}>{count}</Text>
              </View>
            ) : isActive && Icon ? (
              <Icon size={13} color="#007AFF" strokeWidth={2.2} />
            ) : null}
            <Text className="font-semibold" style={{ fontSize: 12, fontWeight: "500", color: isActive ? "#007AFF" : colors.textPrimary }}>
              {label}
            </Text>
            <ChevronDown style={{ marginRight: -1 }} size={16} color={isActive ? "#007AFF" : "#8E8E93"} strokeWidth={2.4} />
          </View>
        </RNHostView>
      </ZStack>
    </Host>
  );
}
