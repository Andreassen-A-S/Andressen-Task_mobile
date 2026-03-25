import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";

interface Props {
  progressPct: number;
  unitLabel?: string;
  onAddProgress: (value: string) => void;
  isUpdating: boolean;
}

export default function TaskProgressCard({ progressPct, unitLabel, onAddProgress, isUpdating }: Props) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");

  const clampedPct = Math.min(100, Math.max(0, progressPct));

  const handleConfirm = () => {
    const num = Number(value);
    if (Number.isFinite(num) && num > 0) {
      onAddProgress(value);
    }
    setVisible(false);
    setValue("");
  };

  const handleCancel = () => {
    setVisible(false);
    setValue("");
  };

  return (
    <>
      <View className="mb-4 rounded-2xl bg-white overflow-hidden shadow-sm">
        <View className="px-4 pt-4 pb-4">
          <View className="flex-row items-stretch justify-between mb-1">
            <Text className="leading-tight" style={[typography.h2, { color: colors.green }]}>
              {clampedPct}%
            </Text>
            <TouchableOpacity
              onPress={() => setVisible(true)}
              disabled={isUpdating}
              className="rounded-xl px-3.5 justify-center disabled:opacity-50"
              style={{ backgroundColor: "rgba(15,110,86,0.12)" }}
            >
              {isUpdating ? (
                <ActivityIndicator color={colors.green} size="small" />
              ) : (
                <Text style={[typography.btnMd, { color: colors.green }]}>
                  + Tilføj {unitLabel || "%"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="h-3 rounded-full overflow-hidden mt-3" style={{ backgroundColor: colors.eggWhite }}>
            <View
              className="h-full rounded-full"
              style={{ width: `${clampedPct}%`, backgroundColor: colors.green }}
            />
          </View>
        </View>
      </View>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <View style={{ width: 280, backgroundColor: colors.surface, borderRadius: 16, padding: 24, gap: 16 }}>
            <Text style={typography.h5}>Tilføj {unitLabel || "fremskridt"}</Text>

            <TextInput
              autoFocus
              keyboardType="numeric"
              value={value}
              onChangeText={setValue}
              onSubmitEditing={handleConfirm}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              style={[typography.bodyMd, {
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.textPrimary,
              }]}
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={handleCancel}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.muted }}
              >
                <Text style={[typography.btnMd, { color: colors.textSecondary }]}>Annuller</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.green }}
              >
                <Text style={[typography.btnMd, { color: colors.white }]}>Tilføj</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
