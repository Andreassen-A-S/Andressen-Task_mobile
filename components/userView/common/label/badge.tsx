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
  sm: "rounded-lg px-2 py-0.5",
  md: "rounded-lg px-2.5 py-1",
  lg: "rounded-lg px-3 py-1.5",
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
