import { View, Text, TouchableOpacity } from "react-native";
import { Task, TaskGoalType, TaskStatus } from "@/types/task";
import {
  formatRelativeDate,
  getPriorityAccentColor,
  translateTaskUnit,
  getPriorityColors,
} from "@/helpers/helpers";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import RecurringBadge from "../common/label/recurringBadge";
import Badge from "../common/label/badge";
import ProjectBadge from "../common/label/projectBadge";
import DeadlineBadge from "../common/label/deadlineBadge";

interface Props {
  task: Task;
  projectName?: string;
  onClick: () => void;
}

export default function UserTaskCard({ task, projectName, onClick }: Props) {
  const isCompleted = task.status === TaskStatus.DONE;
  const isRecurring = !!task.recurring_template_id;
  const progress = task.current_quantity ?? 0;
  const target = task.target_quantity ?? null;
  const unit = translateTaskUnit(task.unit);
  const isPercent = task.unit === "NONE";
  const hasProgress = task.current_quantity != null && task.goal_type === TaskGoalType.FIXED;
  const progressPct = target ? Math.min(Math.round((progress / target) * 100), 100) : null;
  const progressLabel = isPercent
    ? `${progressPct ?? 0}%`
    : target !== null
      ? `${progress} / ${target}${unit ? ` ${unit}` : ""}`
      : `${progress}${unit ? ` ${unit}` : ""}`;

  return (
    <TouchableOpacity
      onPress={onClick}
      className="flex-row border rounded-xl overflow-hidden"
      style={{
        borderColor: colors.border,
        backgroundColor: isCompleted ? colors.surfaceHover : colors.white,
        opacity: isCompleted ? 0.6 : 1,
      }}
    >
      {/* Priority bar */}
      <View className="w-1" style={{ backgroundColor: getPriorityAccentColor(task.priority) }} />

      {/* Content */}
      <View className="flex-1 px-4 py-4">
        {/* Title + badges */}
        <View className="flex-row items-start justify-between gap-2 mb-2">
          <Text
            style={[
              typography.h5,
              {
                flex: 1,
                textDecorationLine: isCompleted ? "line-through" : "none",
                color: isCompleted ? typography.bodySm.color : typography.h5.color,
              },
            ]}
          >
            {task.title}
          </Text>
          <View className="flex-row items-center gap-1.5 pt-0.5 shrink-0">
            {isRecurring && <RecurringBadge size="sm" />}
            <Badge variant="priority" value={task.priority} size="sm" />
          </View>
        </View>

        {/* Description */}
        {task.description ? (
          <Text className="mb-3" style={typography.bodyXs} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        {/* Progress bar */}
        {hasProgress && progressPct !== null && (
          <View className="flex-row items-center gap-2 mb-2">
            <View className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
              <View
                className="h-full rounded-full"
                style={{ width: `${progressPct}%`, backgroundColor: colors.green }}
              />
            </View>
            <Text style={[typography.monoXsAccent, { color: colors.green }]}>{progressLabel}</Text>
          </View>
        )}

        {/* Footer */}
        <View className="flex-row items-center justify-between mt-1">
          <View className="flex-row items-center flex-wrap gap-2">
            {/* Planned date */}
            {/* <Text style={typography.monoXs}>{formatRelativeDate(task.scheduled_date)}</Text> */}

            {/* Done */}
            {isCompleted && (
              <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-md" style={{ backgroundColor: colors.greenLight }}>
                <Ionicons name="checkmark" size={10} color={colors.greenMid} />
                <Text style={[typography.badge, { textTransform: "uppercase", letterSpacing: 1, color: colors.greenMid }]}>
                  FÆRDIG
                </Text>
              </View>
            )}

            {/* Project */}
            {projectName && <ProjectBadge name={projectName} size="sm" />}

            {/* Deadline */}
            <DeadlineBadge deadline={task.deadline} size="sm" />
          </View>

        </View>
      </View>
    </TouchableOpacity>
  );
}