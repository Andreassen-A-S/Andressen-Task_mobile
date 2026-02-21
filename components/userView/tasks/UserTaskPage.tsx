import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { getUserAssignments } from "@/lib/api";
import { Task, TaskGoalType, TaskPriority, TaskStatus } from "@/types/task";
import { toLocalDateKey } from "@/helpers/helpers";
import { sortTasks } from "@/helpers/sort";
import UserTaskDateNavigator from "./UserTaskDateNavigator";
import UserTaskCard from "./UserTaskCard";
import UserTaskDetails from "./taskDetails/UserTaskDetails";
import UserTaskHeader from "../common/UserHeader";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";

const FILTERS = [
  { key: "all", label: "Alle" },
  { key: "highPriority", label: "Høj prioritet" },
  { key: "pending", label: "Mangler" },
  { key: "fixedGoal", label: "Mål-opgaver" },
] as const;

export default function UserTaskPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchTasks = useCallback(async (refresh = false) => {
    if (!user?.user_id) return;
    try {
      refresh ? setIsRefreshing(true) : setIsLoading(true);
      setError(null);
      const assignments = await getUserAssignments(user.user_id);
      setTasks(sortTasks(assignments.map((a) => a.task)));
    } catch {
      setError("Kunne ikke hente opgaver. Prøv igen senere.");
    } finally {
      refresh ? setIsRefreshing(false) : setIsLoading(false);
    }
  }, [user?.user_id]);

  useEffect(() => {
    if (!authLoading && user?.user_id) fetchTasks();
  }, [user?.user_id, authLoading, fetchTasks]);

  const todayKey = toLocalDateKey(selectedDate);

  const tasksForDay = useMemo(() => {
    return tasks.filter((task) => {
      const isDone = task.status === TaskStatus.DONE;
      const scheduledKey = toLocalDateKey(task.scheduled_date);
      const deadlineKey = toLocalDateKey(task.deadline);

      const isScheduledToday = scheduledKey === todayKey;
      const isCarryOverScheduled = scheduledKey < todayKey && !isDone;
      const isDueToday = deadlineKey === todayKey;
      const isOverdue = deadlineKey < todayKey && !isDone;

      return isScheduledToday || isCarryOverScheduled || isDueToday || isOverdue;
    });
  }, [tasks, todayKey]);

  const filteredTasks = useMemo(() => {
    return tasksForDay.filter((task) => {
      if (filter === "highPriority") return task.priority === TaskPriority.HIGH;
      if (filter === "pending")
        return task.status === TaskStatus.PENDING || task.status === TaskStatus.IN_PROGRESS;
      if (filter === "fixedGoal") return task.goal_type === TaskGoalType.FIXED;
      return true;
    });
  }, [tasksForDay, filter]);

  if (authLoading || (isLoading && tasks.length === 0)) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
        <View style={styles.content}>
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.green} />
            <Text style={styles.mutedText}>
              {authLoading ? "Verificerer login..." : "Indlæser opgaver..."}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
        <View style={styles.content}>
          <View style={[styles.center, { paddingHorizontal: 24 }]}>
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => fetchTasks()} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Prøv igen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.content}>
        <UserTaskHeader user={user} heading="Mine opgaver" sub={`Velkommen, ${user?.name}`} />
        <UserTaskDateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.task_id}
          renderItem={({ item }) => (
            <UserTaskCard task={item} onClick={() => setSelectedTaskId(item.task_id)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshing={isRefreshing}
          onRefresh={() => fetchTasks(true)}
          ListHeaderComponent={
            <View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillsContent}
                style={styles.pillsWrapper}
              >
                {FILTERS.map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setFilter(key)}
                    style={[
                      styles.pill,
                      filter === key && styles.pillActive,
                    ]}
                  >
                    <Text
                      style={[
                        filter === key ? typography.labelLgWhite : typography.labelLgGray,
                      ]}
                    >
                      {key === "all" ? `${label} (${tasksForDay.length})` : label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyCard}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyTitle}>Ingen opgaver planlagt for denne dag</Text>
                <Text style={styles.emptySub}>Nye opgaver vil blive vist her</Text>
              </View>
            </View>
          }
        />

        <Modal
          visible={!!selectedTaskId}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedTaskId(null)}
        >
          {selectedTaskId && (
            <UserTaskDetails taskId={selectedTaskId} onBack={() => setSelectedTaskId(null)} onTaskUpdated={fetchTasks} />
          )}
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  content: {
    flex: 1,
    backgroundColor: colors.eggWhite,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mutedText: {
    marginTop: 12,
    color: "#6B7280",
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "center",
  },
  errorText: {
    color: "#991B1B",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#DC2626",
    borderRadius: 10,
  },
  retryBtnText: {
    color: "white",
    fontWeight: "600",
  },

  pillsWrapper: {
    paddingVertical: 4,
  },
  pillsContent: {
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "transparent",
  },
  pillActive: {
    backgroundColor: colors.charcoal,
    borderColor: colors.charcoal,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
    gap: 12,
  },

  emptyWrap: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  emptyCard: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
  },
  emptySub: {
    marginTop: 8,
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
