import { View } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { colors } from "@/constants/colors";

interface RecurringBadgeProps {
  size?: "sm" | "md" | "lg";
}

const containerClass = {
  sm: "flex-row items-center rounded-lg px-1.5 py-1 bg-[#EBF0FD]",
  md: "flex-row items-center rounded-lg px-2.5 py-1 bg-[#EBF0FD]",
  lg: "flex-row items-center rounded-lg px-3 py-1.5 bg-[#EBF0FD]",
};

const iconSize = { sm: 10, md: 12, lg: 14 };

export default function RecurringBadge({ size = "md" }: RecurringBadgeProps) {
  return (
    <View className={containerClass[size]}>
      <FontAwesome6 name="repeat" size={iconSize[size]} color={colors.blue} />
    </View>
  );
}
