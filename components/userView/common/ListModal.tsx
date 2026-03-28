import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import NativeSearchBar from "@/components/userView/common/NativeSearchBar";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import Badge from "@/components/userView/common/label/badge";
import { TaskPriority } from "@/types/task";

export interface ListModalOption {
  label: string;
  value: string;
  accent?: string;
}

interface Props {
  title: string;
  sub?: string;
  options: ListModalOption[];
  selected: string;
  onSelect: (value: string) => void;
  searchable?: boolean;
}

export default function ListModal({ title, sub, options, selected, onSelect, searchable }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useModalHeaderHeight(!!sub) + 20;
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <ModalScreen title={title} sub={sub}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.value}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={{ height: 1, backgroundColor: colors.border }} />
        )}
        ListFooterComponent={() => (
          <View style={{ height: 1, backgroundColor: colors.border }} />
        )}
        ListEmptyComponent={() => (
          <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
            <Text style={[typography.bodySm, { color: colors.textMuted }]}>Ingen resultater</Text>
          </View>
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 16 }} />
        )}
        renderItem={({ item }) => {
          const isSelected = item.value === selected;
          return (
            <TouchableOpacity
              onPress={() => onSelect(item.value)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              {item.accent ? (
                <Badge size="lg" variant="priority" value={item.value as TaskPriority} />
              ) : (
                <Text style={[typography.h6, { flex: 1 }]} numberOfLines={1}>
                  {item.label}
                </Text>
              )}
              <View style={{ flex: 1 }} />
              {isSelected && <Ionicons name="checkmark" size={18} color={colors.green} />}
            </TouchableOpacity>
          );
        }}
      />
      {searchable && <NativeSearchBar placeholder="Søg" onChangeText={setSearch} />}
    </ModalScreen>
  );
}
