import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  monthName: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function CalendarMonthNavigator({ monthName, onPrev, onNext }: Props) {
  return (
    <View className="bg-white border-b border-gray-200 flex-row items-center justify-between px-4 h-12">
      <TouchableOpacity
        onPress={onPrev}
        className="w-8 h-8 border border-gray-200 rounded-lg items-center justify-center"
      >
        <Ionicons name="chevron-back" size={16} color="#6B7084" />
      </TouchableOpacity>
      <Text className="text-base font-semibold text-gray-900">{monthName}</Text>
      <TouchableOpacity
        onPress={onNext}
        className="w-8 h-8 border border-gray-200 rounded-lg items-center justify-center"
      >
        <Ionicons name="chevron-forward" size={16} color="#6B7084" />
      </TouchableOpacity>
    </View>
  );
}
