import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2, MapPinned, SquareChevronUp, UserRound } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { getTasks, getProjects, getUsers } from "@/lib/api";
import { Task, TaskStatus, INACTIVE_STATUSES } from "@/types/task";
import { Project } from "@/types/project";
import { User } from "@/types/users";
import { toDateKey } from "@/helpers/helpers";
import { sortTasks, TaskSortKey } from "@/helpers/sort";
import { pickerStore } from "@/lib/pickerStore";
import { multiSelectStore } from "@/lib/multiSelectStore";
import { ListModalOption } from "@/types/picker";
import { MultiSelectOption } from "@/components/userView/common/MultiPicker";
import { GroupedSelectGroup } from "@/components/userView/common/GroupedSelectModal";
import UserTaskCard from "./UserTaskCard";
import SectionHeader from "./SectionHeader";
import UserHeader from "../common/UserHeader";
import FilterToolbar from "../common/FilterToolbar";
import { colors } from "@/constants/colors";
import ErrorState from "../common/ErrorState";
import Badge from "../common/label/badge";

const SORT_GROUPS: GroupedSelectGroup[] = [
  {
    options: [
      { label: "Deadline (nærmest)", value: "deadline_asc" },
      { label: "Deadline (fjernest)", value: "deadline_desc" },
    ]
  },
  {
    options: [
      { label: "Prioritet (høj til lav)", value: "priority_asc" },
      { label: "Prioritet (lav til høj)", value: "priority_desc" },
    ]
  },
  {
    options: [
      { label: "Startdato (nyeste)", value: "start_desc" },
      { label: "Startdato (ældste)", value: "start_asc" },
    ]
  },
  {
    options: [
      { label: "Nyeste", value: "created_desc" },
      { label: "Ældste", value: "created_asc" },
    ]
  },
];

const SORT_LABELS: Record<TaskSortKey, string> = {
  deadline_asc: "Deadline ↑",
  deadline_desc: "Deadline ↓",
  priority_asc: "Prioritet ↑",
  priority_desc: "Prioritet ↓",
  start_asc: "Startdato ↑",
  start_desc: "Startdato ↓",
  created_desc: "Nyeste",
  created_asc: "Ældste",
};

const STATUS_OPTIONS: ListModalOption[] = [
  { value: TaskStatus.PENDING, icon: <Badge variant="status" value={TaskStatus.PENDING} size="lg" /> },
  { value: TaskStatus.IN_PROGRESS, icon: <Badge variant="status" value={TaskStatus.IN_PROGRESS} size="lg" /> },
  { value: TaskStatus.DONE, icon: <Badge variant="status" value={TaskStatus.DONE} size="lg" /> },
  { value: TaskStatus.REJECTED, icon: <Badge variant="status" value={TaskStatus.REJECTED} size="lg" /> },
  { value: TaskStatus.ARCHIVED, icon: <Badge variant="status" value={TaskStatus.ARCHIVED} size="lg" /> },
];

const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: "Mangler",
  [TaskStatus.IN_PROGRESS]: "I gang",
  [TaskStatus.DONE]: "Udført",
  [TaskStatus.REJECTED]: "Annulleret",
  [TaskStatus.ARCHIVED]: "Arkiveret",
};

const TOOLBAR_HEIGHT = 52;

export default function AdminTaskPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectMap, setProjectMap] = useState<Record<string, Project>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const [filterStatus, setFilterStatus] = useState<TaskStatus | null>(null);
  const [filterProjectIds, setFilterProjectIds] = useState<string[]>([]);
  const [filterAssigneeIds, setFilterAssigneeIds] = useState<string[]>([]);
  const [filterCreatedById, setFilterCreatedById] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<TaskSortKey>("deadline_asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResetKey, setSearchResetKey] = useState(0);

  const hasFilters = !!(filterStatus || filterProjectIds.length || filterAssigneeIds.length || filterCreatedById || searchQuery);
  const activeFilterCount = [filterStatus, filterProjectIds.length ? 1 : 0, filterAssigneeIds.length ? 1 : 0, filterCreatedById ? 1 : 0, sortKey !== "deadline_asc" ? 1 : 0, searchQuery ? 1 : 0].filter(Boolean).length;

  const fetchData = useCallback(async (refresh = false) => {
    try {
      refresh ? setIsRefreshing(true) : setIsLoading(true);
      setError(null);
      const [tasksResult, projectsResult, usersResult] = await Promise.allSettled([
        getTasks(),
        getProjects(),
        getUsers(),
      ]);
      if (tasksResult.status === "rejected") throw tasksResult.reason;
      setTasks(tasksResult.value);
      if (projectsResult.status === "fulfilled") {
        setProjectMap(Object.fromEntries(projectsResult.value.map((p) => [p.project_id, p])));
      }
      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value);
      }
    } catch {
      setError("Kunne ikke hente opgaver. Prøv igen senere.");
    } finally {
      refresh ? setIsRefreshing(false) : setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const selectedDateKey = toDateKey(new Date());

  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let base = tasks.filter((task) => {
      if (!filterStatus && (task.status === TaskStatus.ARCHIVED || task.status === TaskStatus.REJECTED)) return false;
      if (filterStatus && task.status !== filterStatus) return false;
      if (filterProjectIds.length && !filterProjectIds.includes(task.project_id)) return false;
      if (filterAssigneeIds.length && !task.assigned_users?.some((id) => filterAssigneeIds.includes(id))) return false;
      if (filterCreatedById && task.created_by !== filterCreatedById) return false;
      return true;
    });
    if (q) base = base.filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    return base;
  }, [tasks, filterStatus, filterProjectIds, filterAssigneeIds, filterCreatedById, searchQuery]);

  const sortedTasks = useMemo(() => sortTasks(filteredTasks, sortKey), [filteredTasks, sortKey]);

  const overdueTasksList = hasFilters ? [] : sortedTasks.filter((t) =>
    toDateKey(t.deadline) < selectedDateKey && !INACTIVE_STATUSES.includes(t.status)
  );
  const activeTasksList = hasFilters
    ? sortedTasks
    : sortedTasks.filter((t) =>
      toDateKey(t.start_date) <= selectedDateKey &&
      toDateKey(t.deadline) >= selectedDateKey &&
      !INACTIVE_STATUSES.includes(t.status)
    );
  const upcomingTasksList = hasFilters ? [] : sortedTasks.filter((t) =>
    toDateKey(t.start_date) > selectedDateKey &&
    toDateKey(t.deadline) >= selectedDateKey &&
    !INACTIVE_STATUSES.includes(t.status)
  );

  const sections = hasFilters
    ? (activeTasksList.length > 0 ? [{ title: "Resultater", variant: "default" as const, data: activeTasksList, count: activeTasksList.length }] : [])
    : [
      ...(overdueTasksList.length > 0 ? [{ title: "Overskredet", variant: "overdue" as const, data: overdueTasksList, count: overdueTasksList.length }] : []),
      ...(activeTasksList.length > 0 ? [{ title: "Aktive", variant: "default" as const, data: activeTasksList, count: activeTasksList.length }] : []),
      ...(upcomingTasksList.length > 0 ? [{ title: "Kommende", variant: "default" as const, data: upcomingTasksList, count: upcomingTasksList.length }] : []),
    ];

  const userOptions: MultiSelectOption[] = users.map((u) => ({ label: u.name, value: u.user_id, subtitle: u.position?.name ?? undefined, imageUrl: u.profile_picture_url }));
  const projectOptions: MultiSelectOption[] = Object.values(projectMap).map((p) => ({ label: p.name, value: p.project_id, color: p.color ?? undefined }));

  const openStatusFilter = () => {
    pickerStore.set((v) => setFilterStatus(v ? v as TaskStatus : null), STATUS_OPTIONS);
    router.push({ pathname: "/(tabs)/tasks/list-picker", params: { title: "Status", selected: filterStatus ?? "", clearable: "true" } });
  };

  const openProjectFilter = () => {
    multiSelectStore.set(setFilterProjectIds, filterProjectIds);
    router.push({ pathname: "/(tabs)/tasks/multi-picker", params: { title: "Projekt", optionsJson: JSON.stringify(projectOptions) } });
  };

  const openAssigneeFilter = () => {
    multiSelectStore.set(setFilterAssigneeIds, filterAssigneeIds);
    router.push({ pathname: "/(tabs)/tasks/multi-picker", params: { title: "Tildelt", optionsJson: JSON.stringify(userOptions) } });
  };

  const openSortPicker = () => {
    pickerStore.set((v) => { if (v) setSortKey(v as TaskSortKey); });
    router.push({ pathname: "/(tabs)/tasks/grouped-picker", params: { title: "Sorter efter", groupsJson: JSON.stringify(SORT_GROUPS), selected: sortKey } });
  };

  const openCreatedByFilter = () => {
    const slimOptions = users.map((u) => ({ label: u.name, value: u.user_id }));
    pickerStore.set((v) => setFilterCreatedById(v || null), slimOptions);
    router.push({ pathname: "/(tabs)/tasks/list-picker", params: { title: "Oprettet af", selected: filterCreatedById ?? "", searchable: "true", clearable: "true" } });
  };

  const statusLabel = filterStatus
    ? STATUS_LABELS[filterStatus]
    : "Status";
  const projectLabel = filterProjectIds.length === 1
    ? (projectMap[filterProjectIds[0]]?.name ?? "Projekt")
    : filterProjectIds.length > 1 ? "Projekter" : "Projekt";
  const assigneeLabel = filterAssigneeIds.length === 1
    ? (users.find((u) => u.user_id === filterAssigneeIds[0])?.name ?? "Tildelt")
    : filterAssigneeIds.length > 1 ? "Tildelte" : "Tildelt";
  const createdByLabel = filterCreatedById ? (users.find((u) => u.user_id === filterCreatedById)?.name ?? "Oprettet af") : "Oprettet af";

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-charcoal" edges={["top", "left", "right"]}>
        <View className="flex-1 bg-background">
          <ErrorState message={error} onRetry={() => fetchData()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-charcoal" edges={["left", "right"]}>
      <View className="flex-1 bg-background">
        <View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
          <UserHeader
            variant="admin"
            user={user}
            heading="Alle opgaver"
            sub="Admin oversigt"
            onAdd={() => router.push("/(tabs)/tasks/add-project-picker")}
            onSearchChange={setSearchQuery}
            searchResetKey={searchResetKey}
          />
        </View>
        {headerHeight > 0 && (
          <View style={{ position: "absolute", top: headerHeight, left: 0, right: 0, zIndex: 10, height: TOOLBAR_HEIGHT + 16 }} pointerEvents="box-none">
            <FilterToolbar
              height={TOOLBAR_HEIGHT}
              activeCount={activeFilterCount || undefined}
              onClearAll={() => { setFilterStatus(null); setFilterProjectIds([]); setFilterAssigneeIds([]); setFilterCreatedById(null); setSortKey("deadline_asc"); setSearchQuery(""); setSearchResetKey(k => k + 1); }}
              items={[
                { icon: SquareChevronUp, label: statusLabel, variant: filterStatus ? "active" : "regular", onPress: openStatusFilter },
                { icon: MapPinned, label: projectLabel, variant: filterProjectIds.length ? "active" : "regular", count: filterProjectIds.length || undefined, onPress: openProjectFilter },
                { icon: UserRound, label: assigneeLabel, variant: filterAssigneeIds.length ? "active" : "regular", count: filterAssigneeIds.length || undefined, onPress: openAssigneeFilter },
                { icon: UserRound, label: createdByLabel, variant: filterCreatedById ? "active" : "regular", onPress: openCreatedByFilter },
              ]}
              sortItem={{ label: `Sorter: ${SORT_LABELS[sortKey]}`, variant: sortKey !== "deadline_asc" ? "active" : "regular", onPress: openSortPicker }}
            />
          </View>
        )}
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: TOOLBAR_HEIGHT + 8, flexGrow: 1 }}
          refreshing={isRefreshing}
          onRefresh={() => fetchData(true)}
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
                    {hasFilters ? "Ingen opgaver matcher filteret" : "Ingen overskredne, aktive eller kommende opgaver"}
                  </Text>
                  <Text className="body-xs mt-2 text-center">
                    {hasFilters ? "Prøv at ændre eller fjerne et filter" : "Nye opgaver vil blive vist her"}
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
