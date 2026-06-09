import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight, Check, ChevronsUpDown } from "lucide-react-native";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";
import { pickerStore } from "@/lib/pickerStore";
import { goalStore, GoalData } from "@/lib/goalStore";
import { TaskUnit } from "@/types/task";
import { translateTaskUnit, parseLocalizedNumber, formatNumber } from "@/helpers/helpers";
import { showToast } from "@/lib/toast";
import { colors } from "@/constants/colors";
import { ListModalOption } from "@/types/picker";
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
const PERCENT_TARGET = 100;

export default function AddGoalPicker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = useModalHeaderHeight();

  const initial = goalStore.getInitial();
  const [quantityRaw, setQuantityRaw] = useState(initial?.target_quantity != null ? formatNumber(initial.target_quantity) : "");
  const [quantityValue, setQuantityValue] = useState<number | null>(initial?.target_quantity ?? null);
  const [currentRaw, setCurrentRaw] = useState(initial?.current_quantity != null ? formatNumber(initial.current_quantity) : "");
  const [currentValue, setCurrentValue] = useState<number | null>(initial?.current_quantity ?? null);
  const [unit, setUnit] = useState<TaskUnit>(initial?.unit ?? TaskUnit.NONE);
  const isPercentageUnit = unit === TaskUnit.NONE;

  useEffect(() => {
    if (!isPercentageUnit) return;
    setQuantityRaw(formatNumber(PERCENT_TARGET));
    setQuantityValue(PERCENT_TARGET);
  }, [isPercentageUnit]);

  function handleQuantityChange(text: string) {
    setQuantityRaw(text);
    const parsed = parseLocalizedNumber(text);
    setQuantityValue(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
  }

  function handleCurrentChange(text: string) {
    setCurrentRaw(text);
    if (!text.trim()) {
      setCurrentValue(null);
      return;
    }
    const parsed = parseLocalizedNumber(text);
    setCurrentValue(Number.isFinite(parsed) && parsed >= 0 ? parsed : null);
  }

  const handleConfirm = () => {
    if (currentRaw.trim() && currentValue === null) {
      showToast({ title: "Ugyldigt start", message: "Start skal være et gyldigt tal på 0 eller derover." });
      return;
    }

    const current_quantity = currentRaw.trim() ? currentValue ?? undefined : undefined;

    if (isPercentageUnit) {
      goalStore.call({ target_quantity: PERCENT_TARGET, unit: TaskUnit.NONE, current_quantity });
      goalStore.clear();
      router.back();
      return;
    }

    if (quantityRaw.trim() && quantityValue === null) {
      showToast({ title: "Ugyldigt mål", message: "Angiv et gyldigt tal større end 0." });
      return;
    }
    const goal: GoalData | null = quantityValue != null
      ? { target_quantity: quantityValue, unit, current_quantity }
      : null;
    goalStore.call(goal);
    goalStore.clear();
    router.back();
  };

  const handleClose = () => {
    goalStore.clear();
    router.back();
  };

  const handleClear = () => {
    goalStore.call(null);
    goalStore.clear();
    router.back();
  };

  const handleUnitChange = (nextUnit: TaskUnit) => {
    if (nextUnit === TaskUnit.NONE) {
      setQuantityRaw(formatNumber(PERCENT_TARGET));
      setQuantityValue(PERCENT_TARGET);
    } else if (unit === TaskUnit.NONE) {
      setQuantityRaw("");
      setQuantityValue(null);
    }
    setUnit(nextUnit);
  };

  const openUnitPicker = () => {
    pickerStore.set((v) => handleUnitChange(v as TaskUnit));
    router.push({
      pathname: "/(tabs)/tasks/list-picker",
      params: { title: "Enhed", optionsJson: JSON.stringify(UNIT_OPTIONS), selected: unit },
    });
  };

  const unitLabel = UNIT_OPTIONS.find((o) => o.value === unit)?.label ?? translateTaskUnit(unit);
  const canClear = initial != null;

  return (
    <ModalScreen
      title="Mål"
      onClose={handleClose}
      rightContent={
        <GlassIconButton variant="active" icon={Check} size="lg" onPress={handleConfirm} />
      }
    >
      <View className="px-5" style={{ paddingTop: headerHeight + 16, paddingBottom: insets.bottom + 24 }}>
        <View className="rounded-2xl overflow-hidden bg-surface">
          <View className="px-5 py-4">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="caption mb-1">Start</Text>
              </View>
              <View className="w-4" />
              <View className="flex-1">
                <Text className="caption mb-1">Mål</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <TextInput
                  value={currentRaw}
                  onChangeText={handleCurrentChange}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  className="body-md text-center bg-background rounded-xl px-3"
                  style={{ height: 44, lineHeight: undefined, paddingVertical: 0 }}
                />
              </View>
              <View className="w-4 items-center">
                <ArrowRight size={16} color={colors.textMuted} strokeWidth={2.2} />
              </View>
              <View className="flex-1">
                <TextInput
                  value={isPercentageUnit ? formatNumber(PERCENT_TARGET) : quantityRaw}
                  onChangeText={handleQuantityChange}
                  keyboardType="decimal-pad"
                  editable={!isPercentageUnit}
                  placeholder={isPercentageUnit ? formatNumber(PERCENT_TARGET) : "Angiv mål"}
                  placeholderTextColor={colors.textMuted}
                  className={`body-md text-center bg-background rounded-xl px-3 ${isPercentageUnit ? "!text-muted" : ""}`}
                  style={{ height: 44, lineHeight: undefined, paddingVertical: 0 }}
                />
              </View>
            </View>
          </View>
          <View className="h-px bg-border mx-5" />
          <TouchableOpacity
            onPress={openUnitPicker}
            className="flex-row items-center px-5 py-4"
          >
            <View className="flex-1 pr-4">
              <Text className="body-md">Enhed</Text>
            </View>
            <Text className="body-md !text-secondary mr-1">{unitLabel}</Text>
            <ChevronsUpDown size={18} color={colors.textSecondary} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        <View className="self-stretch mt-4">
          <ClearButton label="Ryd mål" onPress={handleClear} disabled={!canClear} className="bg-surface" />
        </View>
      </View>
    </ModalScreen>
  );
}
