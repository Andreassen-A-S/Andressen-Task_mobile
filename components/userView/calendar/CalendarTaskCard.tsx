import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Task, TaskGoalType } from "@/types/task";
import { formatLocalDate, getPriorityAccentColor, translateTaskUnit, translatePriority, getPriorityColors } from "@/helpers/helpers";

interface Props {
  task: Task;
  onClick: () => void;
}

export default function CalendarTaskCard({ task, onClick }: Props) {
  const priorityColors = getPriorityColors(task.priority);
  return (
    <TouchableOpacity
      onPress={onClick}
      style={styles.card}
    >
      <View style={[styles.priorityAccent, { backgroundColor: getPriorityAccentColor(task.priority) }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{task.title}</Text>
          <View style={[styles.badge, priorityColors.container]}>
            <Text style={[styles.badgeText, priorityColors.text]}>{translatePriority(task.priority)}</Text>
          </View>
        </View>
        <Text style={styles.deadline}>
          Deadline: {formatLocalDate(task.deadline)}
          {task.current_quantity != null && task.goal_type === TaskGoalType.FIXED && (
            <Text style={styles.quantity}>
              {"  "}{task.current_quantity}/{task.target_quantity} {translateTaskUnit(task.unit)}
            </Text>
          )}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E6E1",
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
  },
  priorityAccent: {
    width: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1B1D22",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  deadline: {
    fontSize: 12,
    color: "#6B7084",
  },
  quantity: {
    color: "#0f6e56",
  },
});