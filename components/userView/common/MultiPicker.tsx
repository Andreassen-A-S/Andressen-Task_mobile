import { useState, useEffect } from "react";
import { Platform, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";
import SearchBarOverlay from "@/components/userView/common/SearchBarOverlay";
import SingleAvatar from "@/components/userView/common/label/singleAvatar";
import ProjectAvatar from "@/components/userView/common/label/ProjectAvatar";
import { multiSelectStore } from "@/lib/multiSelectStore";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

const SEARCHBAR_HEIGHT = Platform.OS === "ios" ? 56 : 64;

export interface MultiSelectOption {
  label: string;
  value: string;
  subtitle?: string;
  color?: string;
  imageUrl?: string | null;
}

type ListItem =
  | { type: "header"; title: string }
  | { type: "border"; id: string }
  | { type: "placeholder"; id: string }
  | { type: "no-results"; id: string }
  | { type: "divider"; id: string }
  | { type: "option"; option: MultiSelectOption; isSelected: boolean; isLast: boolean };

interface Props {
  title: string;
  options: MultiSelectOption[];
  isLoading?: boolean;
  error?: string | null;
  searchable?: boolean;
}

export default function MultiPicker({ title, options, isLoading, error, searchable = true }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = useModalHeaderHeight(true);

  const [selected, setSelected] = useState<string[]>(multiSelectStore.getInitial());
  const [search, setSearch] = useState("");

  useEffect(() => () => multiSelectStore.clear(), []);

  const add = (value: string) => setSelected((prev) => prev.includes(value) ? prev : [...prev, value]);
  const remove = (value: string) => setSelected((prev) => prev.filter((v) => v !== value));

  const handleConfirm = () => {
    multiSelectStore.call(selected);
    multiSelectStore.clear();
    router.back();
  };

  const handleClose = () => {
    multiSelectStore.clear();
    router.back();
  };

  const selectedOptions = options.filter((o) => selected.includes(o.value));
  const unselectedOptions = options
    .filter((o) => !selected.includes(o.value))
    .filter((o) => !search.trim() || o.label.toLowerCase().includes(search.toLowerCase()));

  const data: ListItem[] = [
    { type: "header", title: "Valgte" },
    { type: "border", id: "selected-top" },
    ...(selectedOptions.length === 0
      ? [{ type: "placeholder", id: "placeholder" } as ListItem]
      : selectedOptions.map((o, i) => ({ type: "option", option: o, isSelected: true, isLast: i === selectedOptions.length - 1 } as ListItem))),
    { type: "border", id: "selected-bottom" },
    { type: "divider", id: "divider" },
    { type: "border", id: "unselected-top" },
    ...(unselectedOptions.length === 0
      ? [{ type: "no-results", id: "no-results" } as ListItem]
      : unselectedOptions.map((o, i) => ({ type: "option", option: o, isSelected: false, isLast: i === unselectedOptions.length - 1 } as ListItem))),
    { type: "border", id: "unselected-bottom" },
  ];

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "header") {
      return (
        <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 6, backgroundColor: colors.eggWhite }}>
          <Text style={typography.overline}>{item.title}</Text>
        </View>
      );
    }
    if (item.type === "border") {
      return <View style={{ height: 1, backgroundColor: colors.border }} />;
    }
    if (item.type === "placeholder") {
      return (
        <View style={{ paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.white }}>
          <Text style={[typography.bodySm, { color: colors.textMuted }]}>Ingen valgt</Text>
        </View>
      );
    }
    if (item.type === "no-results") {
      return (
        <View style={{ paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.white }}>
          <Text style={[typography.bodySm, { color: colors.textMuted }]}>Ingen resultater</Text>
        </View>
      );
    }
    if (item.type === "divider") {
      return <View style={{ height: 16, backgroundColor: colors.eggWhite }} />;
    }
    const { option, isSelected } = item;
    return (
      <TouchableOpacity
        onPress={() => isSelected ? remove(option.value) : add(option.value)}
        style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white }}
      >
        <View style={{ marginRight: 16 }}>
          {option.color
            ? <ProjectAvatar name={option.label} color={option.color} size="sm" />
            : <SingleAvatar name={option.label} imageUrl={option.imageUrl} size="lg" />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={typography.h6} numberOfLines={1}>{option.label}</Text>
          {option.subtitle ? <Text style={typography.bodyXs} numberOfLines={1}>{option.subtitle}</Text> : null}
        </View>
        {isSelected
          ? <Ionicons name="close-circle" size={22} color={colors.textMuted} />
          : <Ionicons name="add-circle-outline" size={22} color={colors.green} />}
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item: ListItem) => {
    if (item.type === "option") return item.option.value;
    if (item.type === "header") return `header-${item.title}`;
    return (item as { id: string }).id;
  };

  return (
    <ModalScreen
      title={title}
      onClose={handleClose}
      rightContent={
        <GlassIconButton variant="active" systemName="checkmark" onPress={handleConfirm} />
      }
    >
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}>
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator color={colors.green} />
            </View>
          ) : error ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
              <Text style={[typography.bodySm, { textAlign: "center" }]}>{error}</Text>
            </View>
          ) : (
            <FlatList
              data={data}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: searchable ? SEARCHBAR_HEIGHT + insets.bottom + 16 : insets.bottom + 16 }}
              ItemSeparatorComponent={({ leadingItem }) => {
                if (leadingItem.type !== "option" || leadingItem.isLast) return null;
                return (
                  <View style={{ backgroundColor: colors.white }}>
                    <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 68 }} />
                  </View>
                );
              }}
            />
          )}
          {searchable && <SearchBarOverlay onChangeText={setSearch} bottomInset={insets.bottom} />}
        </View>
      </KeyboardAvoidingView>
    </ModalScreen>
  );
}
