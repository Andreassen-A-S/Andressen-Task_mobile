import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatRelativeDate, formatLocalDate } from "@/helpers/helpers";

interface Props {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function UserTaskDateNavigator({ selectedDate, onDateChange }: Props) {
  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d);
  };

  return (
    <View className="bg-white border-b border-gray-200 flex-row items-center justify-between px-4 h-12">
      <TouchableOpacity
        onPress={prevDay}
        className="w-8 h-8 border border-gray-200 rounded-lg items-center justify-center"
      >
        <Ionicons name="chevron-back" size={16} color="#6B7084" />
      </TouchableOpacity>

      <View className="items-center">
        <Text className="text-base font-semibold text-gray-900">
          {formatRelativeDate(selectedDate)}
        </Text>
        <Text className="text-xs text-gray-500">
          {formatLocalDate(selectedDate, "da-DK", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </Text>
      </View>

      <TouchableOpacity
        onPress={nextDay}
        className="w-8 h-8 border border-gray-200 rounded-lg items-center justify-center"
      >
        <Ionicons name="chevron-forward" size={16} color="#6B7084" />
      </TouchableOpacity>
    </View>
  );
}
