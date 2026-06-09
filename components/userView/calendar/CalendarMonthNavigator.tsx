import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { colors } from "@/constants/colors";

interface Props {
  monthName: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function CalendarMonthNavigator({ monthName, onPrev, onNext }: Props) {
  return (
    <View className="flex-row items-center justify-between bg-surface px-4 h-12 pt-3">
      <TouchableOpacity
        onPress={onPrev}
        className="w-10 h-10 rounded-lg items-center justify-center"
      >
        <ChevronLeft size={16} color={colors.textSecondary} strokeWidth={2.2} />
      </TouchableOpacity>
      <Text className="h6">{monthName}</Text>
      <TouchableOpacity
        onPress={onNext}
        className="w-10 h-10 rounded-lg items-center justify-center"
      >
        <ChevronRight size={16} color={colors.textSecondary} strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );
}
