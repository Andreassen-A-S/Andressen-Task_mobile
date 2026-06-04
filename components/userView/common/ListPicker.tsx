import { useState, useEffect } from "react";
import { Platform, View, Text, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import SearchBarOverlay from "@/components/userView/common/SearchBarOverlay";
import { pickerStore } from "@/lib/pickerStore";
import { ListModalOption } from "@/types/picker";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

const SEARCHBAR_HEIGHT = Platform.OS === "ios" ? 56 : 64;

export default function ListPicker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { title, sub, optionsJson, selected, searchable, clearable } = useLocalSearchParams<{
    title: string;
    sub?: string;
    optionsJson?: string;
    selected: string;
    searchable?: string;
    clearable?: string;
  }>();

  const [search, setSearch] = useState("");
  const headerHeight = useModalHeaderHeight(!!sub) + 20;

  useEffect(() => () => pickerStore.clear(), []);

  const options: ListModalOption[] = pickerStore.getOptions() ?? (() => {
    try { return JSON.parse(optionsJson ?? "[]"); } catch { return []; }
  })();

  const isClearable = clearable === "true";
  const isSearchable = searchable === "true";

  const filtered = search.trim()
    ? options.filter((o) => o.label?.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = (value: string) => {
    pickerStore.call(value);
    pickerStore.clear();
    router.back();
  };

  return (
    <ModalScreen title={title} sub={sub}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.value}
          contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: isSearchable ? SEARCHBAR_HEIGHT + insets.bottom + 16 : insets.bottom + 16 }}
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
              <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />
            </View>
          )}
          renderItem={({ item }) => {
            const isSelected = item.value === selected;
            return (
              <TouchableOpacity
                onPress={() => handleSelect(isClearable && isSelected ? "" : item.value)}
                style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.white }}
              >
                {item.icon ? <View style={{ marginRight: 12 }}>{item.icon}</View> : null}
                {item.label ? <Text style={[typography.h5, { flex: 1 }]} numberOfLines={1}>{item.label}</Text> : <View style={{ flex: 1 }} />}
                {isSelected && <Ionicons name="checkmark" size={18} color={colors.green} />}
              </TouchableOpacity>
            );
          }}
        />
        {isSearchable && <SearchBarOverlay onChangeText={setSearch} bottomInset={insets.bottom} />}
      </KeyboardAvoidingView>
    </ModalScreen>
  );
}
