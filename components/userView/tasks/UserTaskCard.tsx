import { View, Text, TouchableOpacity } from "react-native";
import { Task, TaskStatus, TaskUnit } from "@/types/task";
import {
  formatNumber,
  getPriorityBarColor,
  translateTaskUnit,
} from "@/helpers/helpers";
import { Check } from "lucide-react-native";
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
  const progress = task.goal?.current_quantity ?? 0;
  const target = task.goal?.target_quantity ?? null;
  const unit = translateTaskUnit(task.goal?.unit);
  const isPercent = task.goal?.unit === TaskUnit.NONE;
  const hasProgress = !!task.goal;
  const progressPct = target ? Math.min(Math.round((progress / target) * 100), 100) : null;
  const progressLabel = isPercent
    ? `${progressPct ?? 0}%`
    : target !== null
      ? `${formatNumber(progress)} / ${formatNumber(target)}${unit ? ` ${unit}` : ""}`
      : `${formatNumber(progress)}${unit ? ` ${unit}` : ""}`;

  return (
    <TouchableOpacity
      onPress={onClick}
      className="flex-row border border-border rounded-xl overflow-hidden"
      style={{
        backgroundColor: isCompleted ? colors.surfaceHover : colors.white,
        opacity: isCompleted ? 0.6 : 1,
      }}
    >
      {/* Priority bar */}
      <View className={`w-1 ${getPriorityBarColor(task.priority)}`} />

      {/* Content */}
      <View className="flex-1 px-4 py-4">
        {/* Title + badges */}
        <View className="flex-row items-start justify-between gap-2 mb-2">
          <Text
            className="h5 flex-1"
            style={{
              textDecorationLine: isCompleted ? "line-through" : "none",
              color: isCompleted ? colors.textSecondary : undefined,
            }}
          >
            {task.title}
          </Text>
          <View className="flex-row items-center gap-1.5 pt-0.5 shrink-0">
            {isRecurring && <RecurringBadge size="sm" iconOnly />}
            <Badge variant="priority" value={task.priority} size="sm" />
          </View>
        </View>

        {/* Description */}
        {task.description ? (
          <Text className="body-xs mb-3" numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        {/* Progress bar */}
        {hasProgress && progressPct !== null && (
          <View className="flex-row items-center gap-2 mb-2">
            <View className="flex-1 h-2 rounded-full overflow-hidden bg-border">
              <View
                className="h-full rounded-full bg-accent"
                style={{ width: `${progressPct}%` }}
              />
            </View>
            <Text className="mono-xs text-accent">{progressLabel}</Text>
          </View>
        )}

        {/* Footer */}
        <View className="flex-row items-center justify-between mt-1">
          <View className="flex-row items-center flex-wrap gap-2">

            {/* Done */}
            {isCompleted && (
              <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-md bg-accent-surface">
                <Check size={10} color={colors.greenMid} strokeWidth={2.4} />
                <Text className="badge-md text-accent-mid uppercase tracking-[1px]">
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
