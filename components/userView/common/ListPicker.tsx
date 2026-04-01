import { useState, useEffect, type ReactNode } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import NativeSearchBar from "@/components/userView/common/NativeSearchBar";
import Badge from "@/components/userView/common/label/badge";
import { pickerStore } from "@/lib/pickerStore";
import { TaskPriority } from "@/types/task";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

export interface ListModalOption {
  label: string;
  value: string;
  accent?: string;
  icon?: ReactNode;
}

export default function ListPicker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { title, sub, optionsJson, selected, searchable, clearable } = useLocalSearchParams<{
    title: string;
    sub?: string;
    optionsJson: string;
    selected: string;
    searchable?: string;
    clearable?: string;
  }>();

  const [search, setSearch] = useState("");
  const headerHeight = useModalHeaderHeight(!!sub) + 20;

  useEffect(() => () => pickerStore.clear(), []);

  let options: ListModalOption[] = [];
  try {
    const parsed: ListModalOption[] = JSON.parse(optionsJson ?? "[]");
    options = parsed.map((o) =>
      o.accent ? { ...o, icon: <Badge size="lg" variant="priority" value={o.value as TaskPriority} /> } : o
    );
  } catch {}

  const isClearable = clearable === "true";
  const isSearchable = searchable === "true";

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = (value: string) => {
    pickerStore.call(value);
    pickerStore.clear();
    router.back();
  };

  return (
    <ModalScreen title={title} sub={sub}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.value}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
        ListFooterComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
        ListEmptyComponent={() => (
          <View style={{ paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.white }}>
            <Text style={[typography.bodySm, { color: colors.textMuted }]}>Ingen resultater</Text>
          </View>
        )}
        ItemSeparatorComponent={() => (
          <View style={{ backgroundColor: colors.white }}>
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 16 }} />
          </View>
        )}
        renderItem={({ item }) => {
          const isSelected = item.value === selected;
          return (
            <TouchableOpacity
              onPress={() => handleSelect(isClearable && isSelected ? "" : item.value)}
              style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.white }}
            >
              {item.icon ? <View style={{ marginRight: 12 }}>{item.icon}</View> : null}
              <Text style={[typography.h5, { flex: 1 }]} numberOfLines={1}>{item.label}</Text>
              {isSelected && <Ionicons name="checkmark" size={18} color={colors.green} />}
            </TouchableOpacity>
          );
        }}
      />
      {isSearchable && <NativeSearchBar placeholder="Søg" onChangeText={setSearch} />}
    </ModalScreen>
  );
}
