import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";
import { pickerStore } from "@/lib/pickerStore";
import { goalStore, type GoalData } from "@/lib/goalStore";
import { TaskGoalType, TaskUnit } from "@/types/task";
import { translateTaskUnit } from "@/helpers/helpers";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { type ListModalOption } from "@/components/userView/common/ListModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ClearButton from "@/components/userView/common/buttons/ClearButton";

const UNIT_OPTIONS: ListModalOption[] = [
  { label: "Procent", value: TaskUnit.NONE },
  { label: "Timer", value: TaskUnit.HOURS },
  { label: "Meter", value: TaskUnit.METERS },
  { label: "Kilometer", value: TaskUnit.KILOMETERS },
  { label: "Liter", value: TaskUnit.LITERS },
  { label: "Kilogram", value: TaskUnit.KILOGRAMS },
  { label: "m²", value: TaskUnit.M2 },
  { label: "m³", value: TaskUnit.M3 },
  { label: "Læs", value: TaskUnit.LOADS },
  { label: "Stik", value: TaskUnit.PLUGS },
  { label: "Ton", value: TaskUnit.TONS },
];

export default function AddGoalPicker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = useModalHeaderHeight();

  useEffect(() => () => goalStore.clear(), []);

  const initial = goalStore.getInitial();
  const [quantity, setQuantity] = useState(initial?.target_quantity?.toString() ?? "");
  const [unit, setUnit] = useState<TaskUnit>(initial?.unit ?? TaskUnit.NONE);

  const handleConfirm = () => {
    const parsed = Number(quantity);
    const goal: GoalData | null = quantity.trim() && parsed > 0
      ? { goal_type: TaskGoalType.FIXED, target_quantity: parsed, unit }
      : null;
    goalStore.call(goal);
    goalStore.clear();
    router.back();
  };

  const handleClose = () => {
    goalStore.clear();
    router.back();
  };

  const openUnitPicker = () => {
    pickerStore.set((v) => setUnit(v as TaskUnit));
    router.push({
      pathname: "/(tabs)/tasks/list-picker",
      params: { title: "Enhed", optionsJson: JSON.stringify(UNIT_OPTIONS), selected: unit },
    });
  };

  const unitLabel = UNIT_OPTIONS.find((o) => o.value === unit)?.label ?? translateTaskUnit(unit);

  return (
    <ModalScreen
      title="Mål"
      onClose={handleClose}
      rightContent={
        <GlassIconButton variant="active" systemName="checkmark" onPress={handleConfirm} />
      }
    >
      <View style={{ paddingTop: headerHeight + 20, paddingBottom: insets.bottom + 24 }}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 6, backgroundColor: colors.eggWhite }}>
        </View>
        <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border }}>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: colors.white,
          }}>
            <Text style={[typography.h6, { flex: 1 }]}>Mål</Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Valgfrit"
              placeholderTextColor={colors.textMuted}
              style={[typography.bodySm, { color: colors.textPrimary, textAlign: "right", minWidth: 80 }]}
            />
          </View>
          <TouchableOpacity
            onPress={openUnitPicker}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 14,
              backgroundColor: colors.white,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Text style={[typography.h6, { flex: 1 }]}>Enhed</Text>
            <Text style={[typography.bodySm, { color: colors.textMuted, marginRight: 6 }]}>{unitLabel}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <View className="mt-6" style={{ alignItems: "center" }}>
          <ClearButton label="Ryd mål" onPress={() => { goalStore.call(null); goalStore.clear(); router.back(); }} />
        </View>
      </View>
    </ModalScreen>
  );
}
