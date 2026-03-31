import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import { pickerStore } from "@/lib/pickerStore";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

export interface GroupedSelectOption {
  label: string;
  value: string;
}

export interface GroupedSelectGroup {
  options: GroupedSelectOption[];
}

interface Props {
  title: string;
  groups: GroupedSelectGroup[];
  selected: string;
}

export default function GroupedSelectModal({ title, groups, selected: initialSelected }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = useModalHeaderHeight();

  const [selected, setSelected] = useState(initialSelected);

  useEffect(() => () => pickerStore.clear(), []);

  const handleSelect = (value: string) => {
    setSelected(value);
    pickerStore.call(value);
    router.back();
  };

  return (
    <ModalScreen title={title}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight + 16, paddingBottom: insets.bottom + 24, paddingHorizontal: 16, gap: 12 }}
      >
        {groups.map((group, gi) => (
          <View
            key={gi}
            style={{ backgroundColor: colors.white, borderRadius: 14, overflow: "hidden" }}
          >
            {group.options.map((option, oi) => {
              const isSelected = option.value === selected;
              const isLast = oi === group.options.length - 1;
              return (
                <View key={option.value}>
                  <TouchableOpacity
                    onPress={() => handleSelect(option.value)}
                    style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 15 }}
                  >
                    <Text style={[typography.h5, { flex: 1 }]}>{option.label}</Text>
                    {isSelected && <Ionicons name="checkmark" size={18} color="#007AFF" />}
                  </TouchableOpacity>
                  {!isLast && <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </ModalScreen>
  );
}
