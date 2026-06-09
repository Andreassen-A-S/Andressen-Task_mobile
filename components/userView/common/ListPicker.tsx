import { useState, useEffect } from "react";
import { Platform, View, Text, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated from "react-native-reanimated";
import ModalScreen, { useCompactingModalHeader, useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import SearchBarOverlay from "@/components/userView/common/SearchBarOverlay";
import { pickerStore } from "@/lib/pickerStore";
import { ListModalOption } from "@/types/picker";
import { colors } from "@/constants/colors";

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
  const { headerStyle, headerPointerEvents, spacerStyle, handleFocusChange } = useCompactingModalHeader(headerHeight);

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
    <ModalScreen
      title={title}
      sub={sub}
      headerStyle={headerStyle}
      headerPointerEvents={headerPointerEvents}
    >
      <KeyboardAvoidingView behavior="padding" className="flex-1" keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}>
        <View className="flex-1">
          <Animated.View style={spacerStyle} />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            contentContainerStyle={{ paddingBottom: isSearchable ? SEARCHBAR_HEIGHT + insets.bottom + 16 : insets.bottom + 16 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View className="px-4 py-3.5 bg-white">
                <Text className="body-sm text-muted">Ingen resultater</Text>
              </View>
            )}
            ItemSeparatorComponent={() => (
              <View className="bg-white">
                <View className="h-px bg-border ml-4" />
              </View>
            )}
            renderItem={({ item }) => {
              const isSelected = item.value === selected;
              return (
                <TouchableOpacity
                  onPress={() => handleSelect(isClearable && isSelected ? "" : item.value)}
                  className="flex-row items-center px-4 py-3.5 bg-white"
                >
                  {item.icon ? <View className="mr-3">{item.icon}</View> : null}
                  {item.label ? <Text className="body-md flex-1" numberOfLines={1}>{item.label}</Text> : <View className="flex-1" />}
                  {isSelected && <Check size={22} color={colors.green} strokeWidth={2.4} />}
                </TouchableOpacity>
              );
            }}
          />
          {isSearchable && <SearchBarOverlay onChangeText={setSearch} onFocusChange={handleFocusChange} bottomInset={20} />}
        </View>
      </KeyboardAvoidingView>
    </ModalScreen>
  );
}
