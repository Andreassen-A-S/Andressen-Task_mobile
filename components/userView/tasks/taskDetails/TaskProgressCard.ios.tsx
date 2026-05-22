import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { typography } from "@/constants/typography";
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
  const clampedPct = Math.min(100, Math.max(0, progressPct));

  const handlePress = (message = "") => {
    Alert.prompt(
      `Tilføj ${unitLabel || "fremskridt"}`,
      message,
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Tilføj",
          onPress: (value?: string) => {
            const num = parseLocalizedNumber(value ?? "");
            if (Number.isFinite(num) && num > 0) {
              onAddProgress(String(num));
            } else {
              handlePress("Indtast et tal større end 0");
            }
          },
        },
      ],
      "plain-text",
      "",
      "decimal-pad"
    );
  };

  return (
    <View className="mb-4 rounded-2xl bg-white overflow-hidden shadow-sm">
      <View className="px-4 pt-4 pb-4">
        <View className="flex-row items-stretch justify-between mb-1">
          <View>
            <Text className="leading-tight" style={[typography.h2, { color: colors.green }]}>
              {formatNumber(clampedPct)}%
            </Text>
            {unitLabel && unitLabel !== "%" && (
              <Text style={[typography.monoXs, { color: colors.textMuted }]}>
                {formatNumber(currentQuantity)} / {formatNumber(targetQuantity)} {unitLabel}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => handlePress()}
            disabled={isUpdating || disabled}
            className="rounded-xl px-3.5 justify-center disabled:opacity-50"
            style={{ backgroundColor: "rgba(15,110,86,0.12)", opacity: disabled || isUpdating ? 0.4 : 1 }}
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
  );
}
