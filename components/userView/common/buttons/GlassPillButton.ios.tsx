import { useIsFocused } from "@react-navigation/native";
import { Host, Image, HStack, Menu, Button } from "@expo/ui/swift-ui";
import { glassEffect, padding, onTapGesture, tint, disabled as disabledModifier } from "@expo/ui/swift-ui/modifiers";
import { colors } from "@/constants/colors";
import { MenuAction, PillItem } from "@/types/pill";

type Variant = "sm" | "lg";

const VARIANTS: Record<Variant, { size: number; paddingSize: number }> = {
  sm: { size: 16, paddingSize: 10 },
  lg: { size: 18, paddingSize: 11 },
};

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
        {items.map((item, index) => {
          const itemPadding = padding({
            vertical: paddingSize,
            horizontal: paddingSize + (index === 0 ? 4 : 0),
          });

          if (item.menuActions?.length) {
            return (
              <Menu
                key={index}
                modifiers={[tint(colors.textPrimary)]}
                label={
                  <Image
                    systemName={item.systemName}
                    size={size}
                    modifiers={[itemPadding]}
                  />
                }
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
            <Image
              key={index}
              systemName={item.systemName}
              size={size}
              modifiers={item.onPress ? [itemPadding, onTapGesture(item.onPress)] : [itemPadding]}
            />
          );
        })}
      </HStack>
    </Host>
  );
}
