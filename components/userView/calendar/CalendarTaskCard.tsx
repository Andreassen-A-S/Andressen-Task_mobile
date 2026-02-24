import { View, Text, TouchableOpacity } from "react-native";
import { Task, TaskGoalType } from "@/types/task";
import { formatLocalDate, getPriorityAccentColor, translateTaskUnit, getPriorityColors } from "@/helpers/helpers";
import { typography } from "@/constants/typography";
import Badge from "../common/label/badge";
import { colors } from "@/constants/colors";

interface Props {
  task: Task;
  onClick: () => void;
}

export default function CalendarTaskCard({ task, onClick }: Props) {
  const hasFixedProgress = task.current_quantity != null && task.goal_type === TaskGoalType.FIXED;
  const isPercent = task.unit === "NONE";
  const progressPct = hasFixedProgress && task.target_quantity
    ? Math.min(Math.round((task.current_quantity! / task.target_quantity) * 100), 100)
    : null;

  return (
    <TouchableOpacity
      onPress={onClick}
      className="flex-row border rounded-lg overflow-hidden"
      style={{ backgroundColor: colors.white, borderColor: colors.border }}
    >
      <View className="w-1" style={{ backgroundColor: getPriorityAccentColor(task.priority) }} />
      <View className="flex-1 px-3 py-2">
        <View className="flex-row items-start justify-between gap-2 mb-1">
          <Text className="flex-1" style={typography.h6}>{task.title}</Text>
          <Badge variant="priority" value={task.priority} />
        </View>
        <Text style={typography.monoXs}>
          Deadline: {formatLocalDate(task.deadline)}
          {hasFixedProgress && (
            <Text style={typography.monoXsAccent}>
              {"  "}{isPercent
                ? `${progressPct ?? 0}%`
                : `${task.current_quantity}/${task.target_quantity} ${translateTaskUnit(task.unit)}`}
            </Text>
          )}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
