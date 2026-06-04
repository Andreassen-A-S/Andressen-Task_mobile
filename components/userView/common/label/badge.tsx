import { View, Text } from "react-native";
import { TaskPriority, TaskStatus } from "@/types/task";
import { getPriorityColors, getStatusColors, translatePriority, translateStatus } from "@/helpers/helpers";
import { typography } from "@/constants/typography";

type BadgeVariant = "priority" | "status";

interface BadgeProps {
  variant: BadgeVariant;
  value: TaskPriority | TaskStatus;
  size?: "sm" | "md" | "lg";
}

const containerClass = {
  sm: "rounded-lg px-2 h-5 items-center justify-center",
  md: "rounded-lg px-2.5 h-6 items-center justify-center",
  lg: "rounded-lg px-3 h-7 items-center justify-center",
};

export default function Badge({ variant, value, size = "md" }: BadgeProps) {
  const themeColors =
    variant === "priority"
      ? getPriorityColors(value as TaskPriority)
      : getStatusColors(value as TaskStatus);

  const label =
    variant === "priority"
      ? translatePriority(value as TaskPriority)
      : translateStatus(value as TaskStatus);

  return (
    <View className={containerClass[size]} style={themeColors.container}>
      <Text style={[typography.badge, themeColors.text]}>{label}</Text>
    </View>
  );
}
