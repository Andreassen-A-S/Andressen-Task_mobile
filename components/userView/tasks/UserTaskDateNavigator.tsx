import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
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
    <View className="bg-surface border-b border-border flex-row items-center justify-between px-4 h-12">
      <TouchableOpacity
        onPress={prevDay}
        className="w-8 h-8 border border-border rounded-lg items-center justify-center"
      >
        <ChevronLeft size={16} color="#6B7084" strokeWidth={2.2} />
      </TouchableOpacity>

      <View className="items-center">
        <Text className="body-md">
          {formatRelativeDate(selectedDate)}
        </Text>
        <Text className="body-sm text-muted">
          {formatLocalDate(selectedDate, "da-DK", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </Text>
      </View>

      <TouchableOpacity
        onPress={nextDay}
        className="w-8 h-8 border border-border rounded-lg items-center justify-center"
      >
        <ChevronRight size={16} color="#6B7084" strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );
}
