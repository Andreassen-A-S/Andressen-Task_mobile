import { View, ScrollView } from "react-native";
import GlassFilterButton from "@/components/userView/common/buttons/GlassFilterButton";
import ClearFiltersButton from "@/components/userView/common/buttons/ClearFiltersButton";
import { colors } from "@/constants/colors";

export interface FilterToolbarItem {
  icon?: string;
  label: string;
  variant: "regular" | "active";
  count?: number;
  onPress: () => void;
}

interface Props {
  items: FilterToolbarItem[];
  height: number;
  activeCount?: number;
  onClearAll?: () => void;
  sortItem?: FilterToolbarItem;
}

export default function FilterToolbar({ items, height, activeCount, onClearAll, sortItem }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
      contentContainerStyle={{ paddingHorizontal: 12, gap: 8, alignItems: "center", height }}
    >
      {activeCount ? <ClearFiltersButton count={activeCount} onPress={onClearAll!} /> : null}
      {items.map((item, i) => (
        <GlassFilterButton key={i} icon={item.icon} label={item.label} variant={item.variant} count={item.count} onPress={item.onPress} />
      ))}
      {sortItem && (
        <>
          <View style={{ width: 1, height: 20, backgroundColor: colors.border, marginHorizontal: 2 }} />
          <GlassFilterButton icon={sortItem.icon} label={sortItem.label} variant={sortItem.variant} onPress={sortItem.onPress} />
        </>
      )}
    </ScrollView>
  );
}
