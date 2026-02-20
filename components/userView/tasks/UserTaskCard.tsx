import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Task, TaskGoalType, TaskStatus } from "@/types/task";
import {
  formatRelativeDate,
  getPriorityAccentColor,
  translateTaskUnit,
  translatePriority,
  getPriorityColors,
} from "@/helpers/helpers";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/constants/typography";
import RecurringBadge from "../common/label/recurringBadge";
import Badge from "../common/label/badge";

interface Props {
  task: Task;
  onClick: () => void;
}

export default function UserTaskCard({ task, onClick }: Props) {
  const isCompleted = task.status === TaskStatus.DONE;
  const isRecurring = !!task.recurring_template_id;
  const progress = task.current_quantity ?? 0;
  const target = task.target_quantity ?? null;
  const unit = translateTaskUnit(task.unit);
  const hasProgress = task.current_quantity != null && task.goal_type === TaskGoalType.FIXED;
  const progressLabel = target !== null
    ? `${progress} / ${target}${unit ? ` ${unit}` : ""}`
    : `${progress}${unit ? ` ${unit}` : ""}`;
  const progressPct = target ? Math.min(Math.round((progress / target) * 100), 100) : null;

  return (
    <TouchableOpacity
      onPress={onClick}
      style={[
        styles.card,
        { backgroundColor: isCompleted ? "#FAFAF7" : "#FFFFFF", opacity: isCompleted ? 0.6 : 1 }
      ]}
    >
      {/* Priority bar */}
      <View style={[styles.priorityBar, { backgroundColor: getPriorityAccentColor(task.priority) }]} />

      {/* Content */}
      <View style={styles.content}>
        {/* Title + date */}
        <View style={styles.header}>
          <Text
            style={[
              typography.h5,
              styles.title,
              {
                textDecorationLine: isCompleted ? "line-through" : "none",
                color: isCompleted ? typography.bodySm.color : typography.h5.color
              }
            ]}
          >
            {task.title}
          </Text>
          <Text style={[typography.monoXs, styles.date]}>
            {formatRelativeDate(task.scheduled_date)}
          </Text>
        </View>

        {/* Description */}
        {task.description ? (
          <Text style={[typography.bodyXs, styles.description]} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        {/* Progress bar */}
        {hasProgress && progressPct !== null && (
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${progressPct}%` }]}
            />
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            {/* Priority badge */}
            <Badge variant="priority" value={task.priority} size="sm" />

            {/* Recurring */}
            {isRecurring && (
              <RecurringBadge size="sm" />
            )}

            {/* Done */}
            {isCompleted && (
              <View style={styles.doneBadge}>
                <Ionicons name="checkmark" size={10} color="#2D9F6F" />
                <Text style={[typography.badge, styles.doneBadgeText]}>FÆRDIG</Text>
              </View>
            )}
          </View>

          {hasProgress && (
            <Text style={[typography.monoXsAccent, styles.progressLabel]}>{progressLabel}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E8E6E1",
    borderRadius: 12,
    overflow: "hidden",
  },
  priorityBar: {
    width: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  title: {
    flex: 1,
  },
  date: {
    paddingTop: 2,
    flexShrink: 0,
  },
  description: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "#E8E6E1",
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#0f6e56",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  doneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#E8F7F0",
  },
  doneBadgeText: {
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#2D9F6F",
  },
  progressLabel: {
    color: "#0f6e56",
  },
});