import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";
import { useRouter } from "expo-router";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import { pickerStore } from "@/lib/pickerStore";
import { colors } from "@/constants/colors";

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
    pickerStore.clear();
    router.back();
  };

  return (
    <ModalScreen title={title}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight + 16, paddingBottom: insets.bottom + 24, paddingHorizontal: 16, gap: 32 }}
      >
        {groups.map((group, gi) => (
          <View
            key={gi}
            className="bg-surface rounded-2xl overflow-hidden"
          >
            {group.options.map((option, oi) => {
              const isSelected = option.value === selected;
              const isLast = oi === group.options.length - 1;
              return (
                <View key={option.value}>
                  <TouchableOpacity
                    onPress={() => handleSelect(option.value)}
                    className="flex-row items-center px-4 py-4"
                  >
                    <Text className="body-lg flex-1">{option.label}</Text>
                    {isSelected && <Check size={22} color={colors.green} strokeWidth={2.4} />}
                  </TouchableOpacity>
                  {!isLast && <View className="h-px bg-border mx-4" />}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </ModalScreen>
  );
}
