import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { getUserAssignments } from "@/lib/api";
import { Task, TaskGoalType, TaskPriority, TaskStatus } from "@/types/task";
import { toLocalDateKey, getPriorityColors } from "@/helpers/helpers";
import { sortTasks } from "@/helpers/sort";
import UserTaskDateNavigator from "./UserTaskDateNavigator";
import UserTaskCard from "./UserTaskCard";
import UserTaskDetails from "./taskDetails/UserTaskDetails";
import UserHeader from "../common/UserHeader";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";

const FILTERS = [
  { key: "all", label: "Alle" },
  { key: "highPriority", label: "Høj prioritet" },
  { key: "pending", label: "Mangler" },
  { key: "fixedGoal", label: "Mål-opgaver" },
] as const;

export default function UserTaskPage() {
  const { user } = useAuth();
  const { taskId: deepLinkTaskId } = useLocalSearchParams<{ taskId?: string }>();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!deepLinkTaskId) return;
    setSelectedTaskId(deepLinkTaskId);
    router.setParams({ taskId: undefined });
  }, [deepLinkTaskId]);

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
    if (user?.user_id) fetchTasks();
  }, [user?.user_id, fetchTasks]);

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

  const scheduledFilteredTasks = filteredTasks.filter(
    (t) => toLocalDateKey(t.scheduled_date) === todayKey,
  );
  const carriedOverFilteredTasks = filteredTasks.filter(
    (t) => toLocalDateKey(t.scheduled_date) !== todayKey,
  );
  const hasBothSections = scheduledFilteredTasks.length > 0 && carriedOverFilteredTasks.length > 0;
  const sections = [
    ...(scheduledFilteredTasks.length > 0
      ? [{ title: "Planlagt", data: scheduledFilteredTasks, count: scheduledFilteredTasks.length }]
      : []),
    ...(carriedOverFilteredTasks.length > 0
      ? [{ title: "Overført", data: carriedOverFilteredTasks, count: carriedOverFilteredTasks.length }]
      : []),
  ];

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-[#1B1D22]" edges={["top", "left", "right"]}>
        <View className="flex-1 bg-[#F6F5F1] items-center justify-center px-6">
          <View className="bg-[#FEF2F2] border-2 border-[#FECACA] rounded-xl p-4 w-full items-center">
            <Text className="text-[#991B1B] font-semibold text-center mb-3">{error}</Text>
            <TouchableOpacity onPress={() => fetchTasks()} className="px-4 py-2.5 bg-[#DC2626] rounded-[10px]">
              <Text className="text-white font-semibold">Prøv igen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#1B1D22]" edges={["left", "right"]}>
      <View className="flex-1 bg-[#F6F5F1]">
        <UserHeader variant="user" user={user} heading="Mine opgaver" sub={`Velkommen, ${user?.name}`} />
        <UserTaskDateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.task_id}
          renderItem={({ item }) => (
            <UserTaskCard task={item} onClick={() => setSelectedTaskId(item.task_id)} />
          )}
          renderSectionHeader={({ section: { title, count } }) => {
            if (title === "Planlagt" && !hasBothSections) return null;
            const isCarriedOver = title === "Overført";
            return (
              <View>
                <View className="flex-row items-center justify-between pt-2.5  bg-[#F6F5F1]">
                  <Text style={typography.labelSmUppercase}>{title}</Text>
                  <View className="bg-[#E5E7EB] rounded-2xl px-2 py-0.5"
                    style={{
                      backgroundColor: isCarriedOver ? colors.redLight : colors.border,
                    }}
                  >
                    <Text style={typography.labelSmUppercase}>{count}</Text>
                  </View>
                </View>
                {/* <LinearGradient
                  colors={["#F6F5F1", "rgba(246,245,241,0)"]}
                  pointerEvents="none"
                  style={{ height: 8, marginBottom: -8 }}
                /> */}
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          SectionSeparatorComponent={() => <View className="h-3" />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 }}
          refreshing={isRefreshing}
          onRefresh={() => fetchTasks(true)}
          stickySectionHeadersEnabled={false} // for making 
          ListHeaderComponent={
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
              className="py-1"
            >
              {FILTERS.map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setFilter(key)}
                  className={`px-4 py-2 rounded-2xl border ${filter === key
                    ? "bg-[#1B1D22] border-[#1B1D22]"
                    : "border-[#E8E6E1]"
                    }`}
                >
                  <Text style={filter === key ? typography.labelLgWhite : typography.labelLgGray}>
                    {key === "all" ? `${label} (${tasksForDay.length})` : label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          }
          ListEmptyComponent={
            isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={colors.green} />
              </View>
            ) : (
              <View className="px-6 pt-6">
                <View className="bg-white rounded-2xl border-2 border-[#E5E7EB] p-6 items-center">
                  <Ionicons name="checkmark-circle-outline" size={48} color="#d1d5db" />
                  <Text className="mt-4 text-base font-semibold text-[#4B5563] text-center">
                    Ingen opgaver planlagt for denne dag
                  </Text>
                  <Text className="mt-2 text-[13px] text-[#9CA3AF] text-center">
                    Nye opgaver vil blive vist her
                  </Text>
                </View>
              </View>
            )
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
