import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";
import NativeSearchBar from "@/components/userView/common/NativeSearchBar";
import SingleAvatar from "@/components/userView/common/label/singleAvatar";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";

export interface MultiSelectOption {
  label: string;
  value: string;
  subtitle?: string;
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
  selected: string[];
  onConfirm: (selected: string[]) => void;
  onClose: () => void;
  searchable?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export default function MultiSelectModal({ title, options, selected: initialSelected, onConfirm, onClose, searchable = true, isLoading, error }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useModalHeaderHeight(true);

  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [search, setSearch] = useState("");

  const add = (value: string) => setSelected((prev) => [...prev, value]);
  const remove = (value: string) => setSelected((prev) => prev.filter((v) => v !== value));

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
          <SingleAvatar name={option.label} size="lg" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={typography.h6} numberOfLines={1}>{option.label}</Text>
          {option.subtitle ? <Text style={typography.bodyXs} numberOfLines={1}>{option.subtitle}</Text> : null}
        </View>
        {isSelected
          ? <Ionicons name="close-circle" size={22} color={colors.textMuted} />
          : <Ionicons name="add-circle-outline" size={22} color={colors.green} />
        }
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
      onClose={onClose}
      rightContent={
        <GlassIconButton variant="active" systemName="checkmark" onPress={() => onConfirm(selected)} />
      }
    >
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
            contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: insets.bottom + 80 }}
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
      </View>
      {searchable && <NativeSearchBar placeholder="Søg" onChangeText={setSearch} />}
    </ModalScreen>
  );
}
