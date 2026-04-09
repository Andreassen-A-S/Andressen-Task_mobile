import { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Task, TaskPriority, TaskStatus, UpdateTaskInput } from "@/types/task";
import { getTask, updateTask, getUsers, getProjects } from "@/lib/api";
import { User } from "@/types/users";
import { Project } from "@/types/project";
import ProjectAvatar from "@/components/userView/common/label/ProjectAvatar";
import { pickerStore } from "@/lib/pickerStore";
import { multiSelectStore } from "@/lib/multiSelectStore";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import Badge from "@/components/userView/common/label/badge";
import SingleAvatar from "@/components/userView/common/label/singleAvatar";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import { formatRelativeDate } from "@/helpers/helpers";
import { ListModalOption } from "@/types/picker";

const PRIORITY_OPTIONS: ListModalOption[] = [
  { value: TaskPriority.LOW, icon: <Badge variant="priority" value={TaskPriority.LOW} size="lg" /> },
  { value: TaskPriority.MEDIUM, icon: <Badge variant="priority" value={TaskPriority.MEDIUM} size="lg" /> },
  { value: TaskPriority.HIGH, icon: <Badge variant="priority" value={TaskPriority.HIGH} size="lg" /> },
];

const STATUS_OPTIONS: ListModalOption[] = [
  { value: TaskStatus.PENDING, icon: <Badge variant="status" value={TaskStatus.PENDING} size="lg" /> },
  { value: TaskStatus.IN_PROGRESS, icon: <Badge variant="status" value={TaskStatus.IN_PROGRESS} size="lg" /> },
  { value: TaskStatus.DONE, icon: <Badge variant="status" value={TaskStatus.DONE} size="lg" /> },
  { value: TaskStatus.REJECTED, icon: <Badge variant="status" value={TaskStatus.REJECTED} size="lg" /> },
  { value: TaskStatus.ARCHIVED, icon: <Badge variant="status" value={TaskStatus.ARCHIVED} size="lg" /> },
];

interface EditRowProps {
  label: string;
  onEdit: () => void;
  isSaving: boolean;
  children: ReactNode;
}

function EditRow({ label, onEdit, isSaving, children }: EditRowProps) {
  return (
    <View style={{ backgroundColor: colors.eggWhite }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 }}>
        <Text style={[typography.overline, { color: colors.textMuted }]}>{label}</Text>
        <TouchableOpacity onPress={onEdit} disabled={isSaving} hitSlop={8}>
          <Text style={[typography.bodySm, { color: colors.blue }]}>Rediger</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, backgroundColor: colors.eggWhite, alignItems: "flex-start" }}>
        {children}
      </View>
    </View>
  );
}

export default function EditTaskModal() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = useModalHeaderHeight(true);

  const [task, setTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const taskRef = useRef<Task | null>(null);
  taskRef.current = task;
  const projectsRef = useRef<Project[]>([]);
  projectsRef.current = projects;

  useEffect(() => {
    Promise.all([getTask(taskId), getUsers(), getProjects()])
      .then(([taskData, usersData, projectsData]) => {
        setTask(taskData);
        setUsers(usersData);
        setProjects(projectsData);
      })
      .catch(() => Alert.alert("Fejl", "Kunne ikke hente opgave"))
      .finally(() => setIsLoading(false));
  }, [taskId]);

  const save = useCallback(async (updates: Partial<UpdateTaskInput>) => {
    const currentTask = taskRef.current;
    if (!currentTask) return;
    setIsSaving(true);
    try {
      const updated = await updateTask(currentTask.task_id, updates);
      setTask(updated);
    } catch {
      Alert.alert("Fejl", "Kunne ikke gemme ændring");
    } finally {
      setIsSaving(false);
    }
  }, []);

  const openAssigneesPicker = () => {
    const currentTask = taskRef.current;
    if (!currentTask) return;
    multiSelectStore.set((values) => {
      save({ assigned_users: values });
    }, currentTask.assigned_users ?? []);
    router.push("/(tabs)/tasks/add-assignees-picker");
  };

  const openPriorityPicker = () => {
    const currentTask = taskRef.current;
    if (!currentTask) return;
    pickerStore.set((value) => {
      if (value) save({ priority: value as TaskPriority });
    }, PRIORITY_OPTIONS);
    router.push({ pathname: "/(tabs)/tasks/list-picker", params: { title: "Prioritet", selected: currentTask.priority } });
  };

  const openStatusPicker = () => {
    const currentTask = taskRef.current;
    if (!currentTask) return;
    pickerStore.set((value) => {
      if (value) save({ status: value as TaskStatus });
    }, STATUS_OPTIONS);
    router.push({ pathname: "/(tabs)/tasks/list-picker", params: { title: "Status", selected: currentTask.status } });
  };

  const openScheduledDatePicker = () => {
    const currentTask = taskRef.current;
    if (!currentTask) return;
    pickerStore.set((value) => {
      if (value) save({ scheduled_date: value + "T00:00:00.000Z" });
    });
    router.push({
      pathname: "/(tabs)/tasks/date-picker",
      params: {
        title: "Planlagt dato",
        selected: currentTask.scheduled_date.split("T")[0],
      },
    });
  };

  const openDeadlinePicker = () => {
    const currentTask = taskRef.current;
    if (!currentTask) return;
    pickerStore.set((value) => {
      if (value) save({ deadline: value + "T23:59:59.000Z" });
    });
    router.push({
      pathname: "/(tabs)/tasks/date-picker",
      params: {
        title: "Deadline",
        selected: currentTask.deadline.split("T")[0],
      },
    });
  };

  const openProjectPicker = () => {
    const currentTask = taskRef.current;
    if (!currentTask) return;
    const options: ListModalOption[] = projectsRef.current.map((p) => ({
      value: p.project_id,
      label: p.name,
      icon: <ProjectAvatar name={p.name} color={p.color} size="sm" />,
    }));
    pickerStore.set((value) => {
      if (value) save({ project_id: value });
    }, options);
    router.push({
      pathname: "/(tabs)/tasks/list-picker",
      params: { title: "Projekt", selected: currentTask.project_id, searchable: "true" },
    });
  };

  const assignedUserObjects = users.filter((u) =>
    task?.assigned_users?.includes(u.user_id)
  );

  return (
    <ModalScreen title="Rediger opgave" sub={task?.title}>
      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.green} size="large" />
        </View>
      ) : task ? (
        <ScrollView
          contentContainerStyle={{
            paddingTop: headerHeight + 8,
            paddingBottom: insets.bottom + 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {isSaving && (
            <View style={{ paddingHorizontal: 16, paddingVertical: 6, alignItems: "flex-end" }}>
              <ActivityIndicator color={colors.textMuted} size="small" />
            </View>
          )}

          <EditRow label="Tildelte" onEdit={openAssigneesPicker} isSaving={isSaving}>
            {assignedUserObjects.length > 0 ? (
              <View style={{ gap: 10 }}>
                {assignedUserObjects.map((u) => (
                  <View key={u.user_id} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <SingleAvatar name={u.name} size="lg" />
                    <Text style={typography.bodySm}>{u.name}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[typography.bodySm, { color: colors.textMuted }]}>Ingen tildelte</Text>
            )}
          </EditRow>

          <EditRow label="Prioritet" onEdit={openPriorityPicker} isSaving={isSaving}>
            <Badge variant="priority" value={task.priority} size="md" />
          </EditRow>

          <EditRow label="Status" onEdit={openStatusPicker} isSaving={isSaving}>
            <Badge variant="status" value={task.status} size="md" />
          </EditRow>

          <EditRow label="Planlagt dato" onEdit={openScheduledDatePicker} isSaving={isSaving}>
            <Text style={typography.bodySm}>
              {task.scheduled_date ? formatRelativeDate(task.scheduled_date) : "Ingen dato"}
            </Text>
          </EditRow>

          <EditRow label="Deadline" onEdit={openDeadlinePicker} isSaving={isSaving}>
            <Text style={typography.bodySm}>
              {task.deadline ? formatRelativeDate(task.deadline) : "Ingen deadline"}
            </Text>
          </EditRow>

          <EditRow label="Projekt" onEdit={openProjectPicker} isSaving={isSaving}>
            {task.project ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <ProjectAvatar name={task.project.name} color={task.project.color} size="sm" />
                <Text style={typography.bodySm}>{task.project.name}</Text>
              </View>
            ) : (
              <Text style={[typography.bodySm, { color: colors.textMuted }]}>Intet projekt</Text>
            )}
          </EditRow>

        </ScrollView>
      ) : null}
    </ModalScreen>
  );
}
