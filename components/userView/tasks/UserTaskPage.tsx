import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2 } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { getUserAssignments, getProjects } from "@/lib/api";
import { Task, INACTIVE_STATUSES } from "@/types/task";
import { Project } from "@/types/project";
import { toDateKey } from "@/helpers/helpers";
import { sortTasks } from "@/helpers/sort";
import UserTaskCard from "./UserTaskCard";
import SectionHeader from "./SectionHeader";
import UserHeader from "../common/UserHeader";
import { colors } from "@/constants/colors";
import ErrorState from "../common/ErrorState";


export default function UserTaskPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectMap, setProjectMap] = useState<Record<string, Project>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchTasks = useCallback(async (refresh = false) => {
    if (!user?.user_id) return;
    try {
      refresh ? setIsRefreshing(true) : setIsLoading(true);
      setError(null);
      const [assignmentsResult, projectsResult] = await Promise.allSettled([
        getUserAssignments(user.user_id),
        getProjects(),
      ]);
      if (assignmentsResult.status === "rejected") throw assignmentsResult.reason;
      setTasks(sortTasks(assignmentsResult.value.map((a) => ({ ...a.task, goal: a.task.goal ?? null })), "priority_asc"));
      if (projectsResult.status === "fulfilled") {
        setProjectMap(Object.fromEntries(projectsResult.value.map((p) => [p.project_id, p])));
      }
    } catch {
      setError("Kunne ikke hente opgaver. Prøv igen senere.");
    } finally {
      refresh ? setIsRefreshing(false) : setIsLoading(false);
    }
  }, [user?.user_id]);

  useFocusEffect(
    useCallback(() => {
      if (user?.user_id) fetchTasks();
    }, [user?.user_id, fetchTasks])
  );

  const selectedDateKey = toDateKey(new Date());

  const overdueTasksList = useMemo(() => tasks.filter((t) =>
    toDateKey(t.deadline) < selectedDateKey && !INACTIVE_STATUSES.includes(t.status)
  ), [tasks, selectedDateKey]);

  const activeTasksList = useMemo(() => tasks.filter((t) =>
    toDateKey(t.start_date) <= selectedDateKey &&
    toDateKey(t.deadline) >= selectedDateKey &&
    !INACTIVE_STATUSES.includes(t.status)
  ), [tasks, selectedDateKey]);

  const sections = [
    ...(overdueTasksList.length > 0 ? [{ title: "Overskredet", variant: "overdue" as const, data: overdueTasksList, count: overdueTasksList.length }] : []),
    ...(activeTasksList.length > 0 ? [{ title: "Aktive", variant: "default" as const, data: activeTasksList, count: activeTasksList.length }] : []),
  ];

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-charcoal" edges={["top", "left", "right"]}>
        <View className="flex-1 bg-background">
          <ErrorState message={error} onRetry={() => fetchTasks()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-charcoal" edges={["left", "right"]}>
      <View className="flex-1 bg-background">
        <UserHeader variant="user" user={user} heading="Mine opgaver" sub={`Velkommen, ${user?.name}`} />
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
          renderSectionHeader={({ section: { title, count, variant } }) => (
            <SectionHeader title={title} count={count} variant={variant} />
          )}
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
                <View className="rounded-2xl border-2 border-border bg-white p-6 items-center">
                  <CheckCircle2 size={48} color={colors.textMuted} strokeWidth={1.8} />
                  <Text className="h5 mt-4 text-center">
                    Ingen aktive eller overskredne opgaver
                  </Text>
                  <Text className="body-xs mt-2 text-center">
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
