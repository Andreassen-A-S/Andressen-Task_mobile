import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import { formatRelativeDate, toLocalDateKey } from "@/helpers/helpers";

interface DeadlineBadgeProps {
  deadline: string;
  size?: "sm" | "md" | "lg";
}

const containerClass = {
  sm: "flex-row items-center gap-1",
  md: "flex-row items-center gap-1.5",
  lg: "flex-row items-center gap-1.5",
};

const iconSize = { sm: 12, md: 13, lg: 13 };

export default function DeadlineBadge({ deadline, size = "md" }: DeadlineBadgeProps) {
  const isOverdue = toLocalDateKey(deadline) < toLocalDateKey(new Date());
  const color = isOverdue ? colors.red : colors.textMuted;

  return (
    <View className={containerClass[size]}>
      {/* <Ionicons name="calendar-clear" size={24} color="black" /> */}
      <Ionicons name="calendar-outline" size={iconSize[size]} color={color} />
      <Text style={[typography.badge, { color }]} numberOfLines={1}>
        {formatRelativeDate(deadline)}
      </Text>
    </View>
  );
}
