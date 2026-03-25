import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";

interface Props {
  progressPct: number;
  unitLabel?: string;
  onAddProgress: (value: string) => void;
  isUpdating: boolean;
}

export default function TaskProgressCard({ progressPct, unitLabel, onAddProgress, isUpdating }: Props) {
  const handlePress = () => {
    Alert.prompt(
      `Tilføj ${unitLabel || "fremskridt"}`,
      undefined,
      (value) => {
        const num = Number(value);
        if (Number.isFinite(num) && num > 0) onAddProgress(value);
      },
      "plain-text",
      undefined,
      "numeric"
    );
  };

  const clampedPct = Math.min(100, Math.max(0, progressPct));

  return (
    <View className="mb-4 rounded-2xl bg-white overflow-hidden shadow-sm">
      <View className="px-4 pt-4 pb-4">
        {/* Heading row */}
        <View className="flex-row items-stretch justify-between mb-1">
          {/* Large percentage */}
          <Text className="leading-tight" style={[typography.h2, { color: colors.green }]}>
            {clampedPct}%
          </Text>
          <TouchableOpacity
            onPress={handlePress}
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



        {/* Progress bar */}
        <View className="h-3 rounded-full overflow-hidden mt-3"
          style={{ backgroundColor: colors.eggWhite }}>
          <View
            className="h-full rounded-full"
            style={{ width: `${clampedPct}%`, backgroundColor: colors.green }}
          />
        </View>
      </View>
    </View >
  );
}
