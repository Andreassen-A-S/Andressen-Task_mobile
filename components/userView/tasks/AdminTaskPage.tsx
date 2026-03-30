import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@/hooks/useAuth";
import { getTasks, getProjects } from "@/lib/api";
import { Task, TaskGoalType, TaskPriority, TaskStatus } from "@/types/task";
import { Project } from "@/types/project";
import { toLocalDateKey } from "@/helpers/helpers";
import { sortTasks } from "@/helpers/sort";
import UserTaskCard from "./UserTaskCard";
import UserHeader from "../common/UserHeader";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";

export default function AdminTaskPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectMap, setProjectMap] = useState<Record<string, Project>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate] = useState(new Date());

  const fetchTasks = useCallback(async (refresh = false) => {
    try {
      refresh ? setIsRefreshing(true) : setIsLoading(true);
      setError(null);
      const [tasksResult, projectsResult] = await Promise.allSettled([
        getTasks(),
        getProjects(),
      ]);
      if (tasksResult.status === "rejected") throw tasksResult.reason;
      setTasks(sortTasks(tasksResult.value));
      if (projectsResult.status === "fulfilled") {
        setProjectMap(Object.fromEntries(projectsResult.value.map((p) => [p.project_id, p])));
      }
    } catch {
      setError("Kunne ikke hente opgaver. Prøv igen senere.");
    } finally {
      refresh ? setIsRefreshing(false) : setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  const selectedDateKey = toLocalDateKey(selectedDate);

  const tasksForDay = useMemo(() => {
    return tasks.filter((task) => {
      const isDone = task.status === TaskStatus.DONE;
      const scheduledKey = toLocalDateKey(task.scheduled_date);
      const deadlineKey = toLocalDateKey(task.deadline);

      const isScheduledToday = scheduledKey === selectedDateKey;
      const isCarryOverScheduled = scheduledKey < selectedDateKey && !isDone;
      const isDueToday = deadlineKey === selectedDateKey;
      const isOverdue = deadlineKey < selectedDateKey && !isDone;

      return isScheduledToday || isCarryOverScheduled || isDueToday || isOverdue;
    });
  }, [tasks, selectedDateKey]);

  const scheduledTasks = tasksForDay.filter(
    (t) => toLocalDateKey(t.scheduled_date) >= selectedDateKey,
  );
  const carriedOverTasks = tasksForDay.filter(
    (t) => toLocalDateKey(t.scheduled_date) < selectedDateKey,
  );
  const hasBothSections = scheduledTasks.length > 0 && carriedOverTasks.length > 0;
  const sections = [
    ...(scheduledTasks.length > 0
      ? [{ title: "Planlagt", data: scheduledTasks, count: scheduledTasks.length }]
      : []),
    ...(carriedOverTasks.length > 0
      ? [{ title: "Overført", data: carriedOverTasks, count: carriedOverTasks.length }]
      : []),
  ];

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-[#1B1D22]" edges={["top", "left", "right"]}>
        <View className="flex-1 bg-[#F6F5F1] items-center justify-center px-6">
          <View className="rounded-xl p-4 w-full items-center border-2"
            style={{ backgroundColor: colors.redLight, borderColor: colors.redBorder }}>
            <Text className="font-semibold text-center mb-3" style={{ color: colors.redText }}>{error}</Text>
            <TouchableOpacity onPress={() => fetchTasks()} className="px-4 py-2.5 rounded-[10px]"
              style={{ backgroundColor: colors.red }}>
              <Text style={typography.btnMdWhite}>Prøv igen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#1B1D22]" edges={["left", "right"]}>
      <View className="flex-1 bg-[#F6F5F1]">
        <UserHeader
          variant="admin"
          user={user}
          heading="Alle opgaver"
          sub="Admin oversigt"
          onAdd={() => router.push("/(tabs)/tasks/add-project-picker")}
        />
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.task_id}
          renderItem={({ item }) => (
            <UserTaskCard
              task={item}
              projectName={projectMap[item.project_id]?.name}
              onClick={() => router.push(`/(tabs)/tasks/${item.task_id}`)}
            />
          )}
          renderSectionHeader={({ section: { title, count } }) => {
            if (title === "Planlagt" && !hasBothSections) return null;
            const isCarriedOver = title === "Overført";
            return (
              <View>
                <View className="flex-row items-center justify-between pt-2.5 bg-[#F6F5F1]">
                  <Text style={typography.labelSmUppercase}>{title}</Text>
                  <View className="rounded-2xl px-2 py-0.5"
                    style={{ backgroundColor: isCarriedOver ? colors.redLight : colors.border }}>
                    <Text style={typography.labelSmUppercase}>{count}</Text>
                  </View>
                </View>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          SectionSeparatorComponent={() => <View className="h-3" />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8, flexGrow: 1 }}
          refreshing={isRefreshing}
          onRefresh={() => fetchTasks(true)}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={colors.green} />
              </View>
            ) : (
              <View className="px-6 pt-6">
                <View className="rounded-2xl border-2 p-6 items-center"
                  style={{ backgroundColor: colors.white, borderColor: colors.border }}>
                  <Ionicons name="checkmark-circle-outline" size={48} color={colors.textMuted} />
                  <Text className="mt-4 text-center" style={[typography.h5, { marginTop: 16 }]}>
                    Ingen opgaver planlagt i dag
                  </Text>
                  <Text className="mt-2 text-center" style={typography.bodyXs}>
                    Nye opgaver vil blive vist her
                  </Text>
                </View>
              </View>
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}
