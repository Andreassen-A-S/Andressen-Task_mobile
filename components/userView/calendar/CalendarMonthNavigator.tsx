import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

interface Props {
  monthName: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function CalendarMonthNavigator({ monthName, onPrev, onNext }: Props) {
  return (
    <View
      className="flex-row items-center justify-between px-4 h-12 pt-3"
      style={{ backgroundColor: colors.surface }}
    >
      <TouchableOpacity
        onPress={onPrev}
        className="w-10 h-10 rounded-lg items-center justify-center"
      >
        <Ionicons name="chevron-back" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
      <Text style={[typography.h6, { color: colors.textPrimary }]}>{monthName}</Text>
      <TouchableOpacity
        onPress={onNext}
        className="w-10 h-10 rounded-lg items-center justify-center"
      >
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}
