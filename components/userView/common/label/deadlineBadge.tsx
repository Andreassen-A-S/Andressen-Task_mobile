import { View, Text } from "react-native";
import { Clock } from "lucide-react-native";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import { formatRelativeDate, toDateKey } from "@/helpers/helpers";

interface DeadlineBadgeProps {
  deadline: string;
  size?: "sm" | "md" | "lg";
}

const containerClass = {
  sm: "flex-row items-center gap-1",
  md: "flex-row items-center gap-1.5",
  lg: "flex-row items-center gap-1.5",
};

const iconSize = { sm: 10, md: 12, lg: 14 };

export default function DeadlineBadge({ deadline, size = "md" }: DeadlineBadgeProps) {
  const today = toDateKey(new Date());
  const d = toDateKey(deadline);
  const color = d < today ? colors.red : d === today ? colors.yellow : colors.textMuted;

  return (
    <View className={containerClass[size]}>
      <Clock size={iconSize[size]} color={color} />
      <Text style={[typography.badge, { color }]} numberOfLines={1}>
        {formatRelativeDate(deadline)}
      </Text>
    </View>
  );
}
