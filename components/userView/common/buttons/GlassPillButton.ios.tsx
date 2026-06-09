import { View } from "react-native";
import { useIsFocused } from "expo-router/react-navigation";
import { Host, HStack, Menu, Button, RNHostView, ZStack } from "@expo/ui/swift-ui";
import { buttonStyle, contentShape, frame, glassEffect, padding, shapes, tint, disabled as disabledModifier } from "@expo/ui/swift-ui/modifiers";
import { Ellipsis, type LucideIcon } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { PillItem } from "@/types/pill";

type Variant = "sm" | "lg";

const VARIANTS: Record<Variant, { size: number; paddingSize: number }> = {
  sm: { size: 20, paddingSize: 12 },
  lg: { size: 24, paddingSize: 12 },
};

interface Props {
  items: PillItem[];
  variant?: Variant;
}

function PillIcon({ Icon, size, paddingSize, isFirst }: {
  Icon: LucideIcon;
  size: number;
  paddingSize: number;
  isFirst: boolean;
}) {
  return (
    <ZStack
      modifiers={[
        frame({ width: size, height: size }),
        padding({
          vertical: paddingSize,
          leading: paddingSize + (isFirst ? 4 : 0),
          trailing: paddingSize,
        }),
        contentShape(shapes.rectangle()),
      ]}
    >
      <RNHostView>
        <View pointerEvents="none" style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
          <Icon size={size} color={colors.textPrimary} strokeWidth={1.6} />
        </View>
      </RNHostView>
    </ZStack>
  );
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
        {items.map((item, index) => {
          const Icon = item.icon ?? Ellipsis;

          if (item.menuActions?.length) {
            return (
              <Menu
                key={index}
                modifiers={[tint(colors.textPrimary)]}
                label={<PillIcon Icon={Icon} size={size} paddingSize={paddingSize} isFirst={index === 0} />}
              >
                {item.menuActions.map((action, i) => (
                  <Button
                    key={i}
                    label={action.label}
                    systemImage={action.systemImage}
                    role={action.role}
                    onPress={action.onPress}
                    modifiers={[
                      ...(action.role === "destructive" ? [tint("#FF3B30")] : []),
                      ...(action.disabled ? [disabledModifier(true)] : []),
                    ]}
                  />
                ))}
              </Menu>
            );
          }

          return (
            <Button
              key={index}
              onPress={item.onPress}
              modifiers={[buttonStyle("plain")]}
            >
              <PillIcon
                Icon={Icon}
                size={size}
                paddingSize={paddingSize}
                isFirst={index === 0}
              />
            </Button>
          );
        })}
      </HStack>
    </Host>
  );
}
