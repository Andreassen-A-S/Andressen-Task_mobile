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
import { getTasks, getProjects, getUsers } from "@/lib/api";
import { Task, TaskStatus, INACTIVE_STATUSES } from "@/types/task";
import { Project } from "@/types/project";
import { User } from "@/types/users";
import { toLocalDateKey } from "@/helpers/helpers";
import { sortTasks, type TaskSortKey } from "@/helpers/sort";
import { pickerStore } from "@/lib/pickerStore";
import { multiSelectStore } from "@/lib/multiSelectStore";
import { type ListModalOption } from "@/components/userView/common/ListPicker";
import { type MultiSelectOption } from "@/components/userView/common/MultiPicker";
import { type GroupedSelectGroup } from "@/components/userView/common/GroupedSelectModal";
import UserTaskCard from "./UserTaskCard";
import UserHeader from "../common/UserHeader";
import FilterToolbar from "../common/FilterToolbar";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";

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
      { label: "Planlagt (nyeste)", value: "scheduled_desc" },
      { label: "Planlagt (ældste)", value: "scheduled_asc" },
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
  scheduled_asc: "Planlagt ↑",
  scheduled_desc: "Planlagt ↓",
  created_desc: "Nyeste",
  created_asc: "Ældste",
};

const STATUS_OPTIONS: ListModalOption[] = [
  { label: "Mangler", value: TaskStatus.PENDING },
  { label: "I gang", value: TaskStatus.IN_PROGRESS },
  { label: "Udført", value: TaskStatus.DONE },
  { label: "Annulleret", value: TaskStatus.REJECTED },
  { label: "Arkiveret", value: TaskStatus.ARCHIVED },
];

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
  const [selectedDate] = useState(new Date());
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

  const selectedDateKey = toLocalDateKey(selectedDate);

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
    toLocalDateKey(t.deadline) < selectedDateKey && !INACTIVE_STATUSES.includes(t.status)
  );
  const activeTasksList = hasFilters
    ? sortedTasks
    : sortedTasks.filter((t) =>
        toLocalDateKey(t.scheduled_date) <= selectedDateKey &&
        toLocalDateKey(t.deadline) >= selectedDateKey &&
        !INACTIVE_STATUSES.includes(t.status)
      );
  const upcomingTasksList = hasFilters ? [] : sortedTasks.filter((t) =>
    toLocalDateKey(t.scheduled_date) > selectedDateKey &&
    toLocalDateKey(t.deadline) >= selectedDateKey &&
    !INACTIVE_STATUSES.includes(t.status)
  );

  const sections = hasFilters
    ? (activeTasksList.length > 0 ? [{ title: "Resultater", data: activeTasksList, count: activeTasksList.length }] : [])
    : [
      ...(overdueTasksList.length > 0 ? [{ title: "Overskredet", data: overdueTasksList, count: overdueTasksList.length }] : []),
      ...(activeTasksList.length > 0 ? [{ title: "Aktive", data: activeTasksList, count: activeTasksList.length }] : []),
      ...(upcomingTasksList.length > 0 ? [{ title: "Kommende", data: upcomingTasksList, count: upcomingTasksList.length }] : []),
    ];

  const userOptions: MultiSelectOption[] = users.map((u) => ({ label: u.name, value: u.user_id, subtitle: u.position ?? undefined }));
  const projectOptions: MultiSelectOption[] = Object.values(projectMap).map((p) => ({ label: p.name, value: p.project_id, color: p.color ?? undefined }));

  const openStatusFilter = () => {
    pickerStore.set((v) => setFilterStatus(v ? v as TaskStatus : null));
    router.push({ pathname: "/(tabs)/tasks/list-picker", params: { title: "Status", optionsJson: JSON.stringify(STATUS_OPTIONS), selected: filterStatus ?? "", clearable: "true" } });
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
    pickerStore.set((v) => setFilterCreatedById(v || null));
    router.push({ pathname: "/(tabs)/tasks/list-picker", params: { title: "Oprettet af", optionsJson: JSON.stringify(userOptions), selected: filterCreatedById ?? "", searchable: "true", clearable: "true" } });
  };

  const statusLabel = filterStatus
    ? (STATUS_OPTIONS.find((o) => o.value === filterStatus)?.label ?? "Status")
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
      <SafeAreaView className="flex-1 bg-[#1B1D22]" edges={["top", "left", "right"]}>
        <View className="flex-1 bg-[#F6F5F1] items-center justify-center px-6">
          <View className="rounded-xl p-4 w-full items-center border-2"
            style={{ backgroundColor: colors.redLight, borderColor: colors.redBorder }}>
            <Text className="font-semibold text-center mb-3" style={{ color: colors.redText }}>{error}</Text>
            <TouchableOpacity onPress={() => fetchData()} className="px-4 py-2.5 rounded-[10px]"
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
                { icon: "flag", label: statusLabel, variant: filterStatus ? "active" : "regular", onPress: openStatusFilter },
                { icon: "folder", label: projectLabel, variant: filterProjectIds.length ? "active" : "regular", count: filterProjectIds.length || undefined, onPress: openProjectFilter },
                { icon: "person", label: assigneeLabel, variant: filterAssigneeIds.length ? "active" : "regular", count: filterAssigneeIds.length || undefined, onPress: openAssigneeFilter },
                { icon: "person.badge.plus", label: createdByLabel, variant: filterCreatedById ? "active" : "regular", onPress: openCreatedByFilter },
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
          renderSectionHeader={({ section: { title, count } }) => {
            const isOverdue = title === "Overskredet";
            return (
              <View>
                <View className="flex-row items-center justify-between pt-2.5 bg-[#F6F5F1]">
                  <Text style={typography.labelSmUppercase}>{title}</Text>
                  <View className="rounded-2xl px-2 py-0.5"
                    style={{ backgroundColor: isOverdue ? colors.redLight : colors.border }}>
                    <Text style={typography.labelSmUppercase}>{count}</Text>
                  </View>
                </View>
              </View>
            );
          }}
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
                <View className="rounded-2xl border-2 p-6 items-center"
                  style={{ backgroundColor: colors.white, borderColor: colors.border }}>
                  <Ionicons name="checkmark-circle-outline" size={48} color={colors.textMuted} />
                  <Text className="mt-4 text-center" style={[typography.h5, { marginTop: 16 }]}>
                    {hasFilters ? "Ingen opgaver matcher filteret" : "Ingen overskredne, aktive eller kommende opgaver"}
                  </Text>
                  <Text className="mt-2 text-center" style={typography.bodyXs}>
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
