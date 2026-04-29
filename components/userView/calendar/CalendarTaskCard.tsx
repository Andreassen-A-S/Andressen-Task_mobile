import { View, Text, TouchableOpacity } from "react-native";
import { Task, TaskGoalType, TaskStatus, TaskUnit } from "@/types/task";
import { formatLocalDate, formatNumber, getPriorityAccentColor, translateTaskUnit } from "@/helpers/helpers";
import { typography } from "@/constants/typography";
import Badge from "../common/label/badge";
import RecurringBadge from "../common/label/recurringBadge";
import { colors } from "@/constants/colors";

interface Props {
  task: Task;
  onClick: () => void;
}

export default function CalendarTaskCard({ task, onClick }: Props) {
  const isCompleted = task.status === TaskStatus.DONE;
  const isRecurring = !!task.recurring_template_id;
  const hasFixedProgress = task.current_quantity != null && task.target_quantity != null && task.goal_type === TaskGoalType.FIXED;
  const isPercent = task.unit === TaskUnit.NONE;
  const progress = task.current_quantity ?? 0;
  const target = task.target_quantity ?? null;
  const unit = translateTaskUnit(task.unit);
  const progressPct = hasFixedProgress && target
    ? Math.min(Math.round((progress / target) * 100), 100)
    : null;
  const progressLabel = isPercent
    ? `${progressPct ?? 0}%`
    : target !== null
      ? `${formatNumber(progress)} / ${formatNumber(target)}${unit ? ` ${unit}` : ""}`
      : `${formatNumber(progress)}${unit ? ` ${unit}` : ""}`;

  return (
    <TouchableOpacity
      onPress={onClick}
      className="flex-row border rounded-lg overflow-hidden"
      style={{
        backgroundColor: isCompleted ? colors.surfaceHover : colors.white,
        borderColor: colors.border,
        opacity: isCompleted ? 0.6 : 1,
      }}
    >
      <View className="w-1" style={{ backgroundColor: getPriorityAccentColor(task.priority) }} />
      <View className="flex-1 px-3 py-2">
        <View className="flex-row items-start justify-between gap-2 mb-1">
          <Text
            className="flex-1"
            style={[
              typography.h6,
              isCompleted && { textDecorationLine: "line-through", color: typography.bodySm.color },
            ]}
          >
            {task.title}
          </Text>
          <View className="flex-row items-center gap-1.5 pt-0.5 shrink-0">
            {isRecurring && <RecurringBadge size="sm" />}
            <Badge variant="priority" value={task.priority} />
          </View>
        </View>
        <Text style={typography.monoXs}>
          Deadline: {formatLocalDate(task.deadline)}
          {hasFixedProgress && (
            <Text style={typography.monoXsAccent}>{"  "}{progressLabel}</Text>
          )}
        </Text>
        {isCompleted && (
          <View className="mt-1 self-start">
            <Badge variant="status" value={TaskStatus.DONE} size="sm" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
