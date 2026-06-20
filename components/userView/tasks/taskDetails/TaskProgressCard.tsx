import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { colors } from "@/constants/colors";
import { parseLocalizedNumber, formatNumber } from "@/helpers/helpers";

interface Props {
  progressPct: number;
  unitLabel?: string;
  currentQuantity: number;
  targetQuantity: number;
  onAddProgress: (value: string) => void;
  isUpdating: boolean;
  disabled?: boolean;
}

export default function TaskProgressCard({ progressPct, unitLabel, currentQuantity, targetQuantity, onAddProgress, isUpdating, disabled = false }: Props) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const [inputError, setInputError] = useState(false);

  const clampedPct = Math.min(100, Math.max(0, progressPct));

  const handleConfirm = () => {
    const num = parseLocalizedNumber(value);
    if (!Number.isFinite(num) || num <= 0) {
      setInputError(true);
      return;
    }
    onAddProgress(String(num));
    setVisible(false);
    setValue("");
    setInputError(false);
  };

  const handleCancel = () => {
    setVisible(false);
    setValue("");
    setInputError(false);
  };

  return (
    <>
      <View className="mb-4 rounded-2xl bg-white overflow-hidden shadow-sm">
        <View className="px-4 pt-4 pb-4">
          <View className="flex-row items-stretch justify-between mb-1">
            <View>
              <Text className="h2 text-accent leading-tight">
                {formatNumber(clampedPct)}%
              </Text>
              {unitLabel && unitLabel !== "%" && (
                <Text className="mono-xs text-muted-foreground">
                  {formatNumber(currentQuantity)} / {formatNumber(targetQuantity)} {unitLabel}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setVisible(true)}
              disabled={isUpdating || disabled}
              className="rounded-xl px-3.5 justify-center disabled:opacity-50"
              style={{ backgroundColor: "rgba(15,110,86,0.12)", opacity: disabled || isUpdating ? 0.4 : 1 }}
            >
              {isUpdating ? (
                <ActivityIndicator color={colors.green} size="small" />
              ) : (
                <Text className="btn-md text-accent">
                  + Tilføj {unitLabel || "%"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="h-3 rounded-full overflow-hidden mt-3 bg-background">
            <View
              className="h-full rounded-full"
              style={{ width: `${clampedPct}%`, backgroundColor: colors.green }}
            />
          </View>
        </View>
      </View>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
        <KeyboardAvoidingView
          behavior="padding"
          className="flex-1 justify-center items-center bg-black/40"
        >
          <View className="w-[280px] bg-surface rounded-2xl p-6 gap-4">
            <Text className="h5">Tilføj {unitLabel || "fremskridt"}</Text>

            <TextInput
              autoFocus
              keyboardType="decimal-pad"
              value={value}
              onChangeText={(v) => { setValue(v); setInputError(false); }}
              onSubmitEditing={handleConfirm}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              className="body-md border rounded-[10] px-3 py-2.5"
              style={{ borderColor: inputError ? colors.redBorder : colors.border }}
            />
            {inputError && (
              <Text className="body-xs text-danger-text">Indtast et gyldigt tal større end 0</Text>
            )}

            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 py-3 rounded-[10px] items-center bg-muted"
              >
                <Text className="btn-md text-secondary">Annuller</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                className="flex-1 py-3 rounded-[10px] items-center bg-accent"
              >
                <Text className="btn-md text-white">Tilføj</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
