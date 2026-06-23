import { View, Text } from "react-native";
import { TaskPriority, TaskStatus } from "@/types/task";
import { getPriorityColors, getStatusColors, translatePriority, translateStatus } from "@/helpers/helpers";

type BadgeVariant = "priority" | "status";

interface BadgeProps {
  variant: BadgeVariant;
  value: TaskPriority | TaskStatus;
  size?: "sm" | "md" | "lg";
}

const containerSize = {
  sm: "rounded-full border h-5 px-1.5 items-center justify-center",
  md: "rounded-full border h-6 px-2 items-center justify-center",
  lg: "rounded-full border h-7 px-2.5 items-center justify-center",
};

const textSize = {
  sm: "badge-sm",
  md: "badge-md",
  lg: "badge-lg",
};

export default function Badge({ variant, value, size = "md" }: BadgeProps) {
  const colorClass = variant === "priority"
    ? getPriorityColors(value as TaskPriority)
    : getStatusColors(value as TaskStatus);
  const label = variant === "priority"
    ? translatePriority(value as TaskPriority)
    : translateStatus(value as TaskStatus);

  return (
    <View className={`${containerSize[size]} ${colorClass}`}>
      <Text className={textSize[size]}>{label}</Text>
    </View>
  );
}
