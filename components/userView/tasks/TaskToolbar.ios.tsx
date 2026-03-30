import { useRef } from "react";
import { useIsFocused } from "@react-navigation/native";
import { Host, ScrollView, HStack } from "@expo/ui/swift-ui";
import { padding } from "@expo/ui/swift-ui/modifiers";
import ToolbarGlassButton from "@/components/userView/common/buttons/ToolbarGlassButton";

export interface TaskToolbarItem {
  icon: string;
  label: string;
  tint?: string;
  onPress: () => void;
}

interface Props {
  items: TaskToolbarItem[];
}

export default function TaskToolbar({ items }: Props) {
  const isFocused = useIsFocused();
  const pressRefs = useRef<Array<() => void>>([]);
  pressRefs.current = items.map((item) => item.onPress);

  return (
    <Host style={{ height: 34 }}>
      <ScrollView axes="horizontal" showsIndicators={false}>
        <HStack spacing={8} alignment="center" modifiers={[padding({ horizontal: 12 })]}>
          {items.map((item, i) => (
            <ToolbarGlassButton
              key={i}
              icon={item.icon}
              label={item.label}
              tint={item.tint}
              isFocused={isFocused}
              onPress={() => pressRefs.current[i]?.()}
            />
          ))}
        </HStack>
      </ScrollView>
    </Host>
  );
}
