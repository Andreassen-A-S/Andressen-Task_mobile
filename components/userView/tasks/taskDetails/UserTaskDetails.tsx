import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Calendar, Camera, Clock, Folder, Lock, MessageCircle } from "lucide-react-native";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";
import { Task, TaskStatus, TaskUnit } from "@/types/task";
import { isAdminRole, User, UserRole } from "@/types/users";
import { addTaskProgress, getTask, updateTask, getUser, deleteTask } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeDate, translateTaskUnit } from "@/helpers/helpers";
import { useRouter, Stack, useLocalSearchParams, usePathname, useFocusEffect, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TaskDetailsHeader from "./TaskDetailsHeader";
import { colors } from "@/constants/colors";
import SingleAvatar from "../../common/label/singleAvatar";
import Badge from "../../common/label/badge";
import RecurringBadge from "../../common/label/recurringBadge";
import SlideToComplete from "../../common/SlideToComplete";
import TaskProgressCard from "./TaskProgressCard";
import { CancelableNavigationTask, runAfterNavigationFrame } from "@/lib/navigationTiming";

export default function UserTaskDetails() {
  const { taskId, openComments: shouldOpenComments, openCommentsRequestId, commentId } = useLocalSearchParams<{
    taskId: string;
    openComments?: string;
    openCommentsRequestId?: string;
    commentId?: string;
  }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const consumedOpenCommentsRef = useRef<string | null>(null);

  const fetchTask = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setError(null);
        setIsLoading(true);
      }
      const taskData = await getTask(taskId);
      setTask(taskData);
      setError(null);
      if (taskData.created_by) {
        try {
          setCreator(await getUser(taskData.created_by));
        } catch { }
      }
    } catch {
      if (!silent) setError("Kunne ikke hente opgave detaljer");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [taskId]);

  useFocusEffect(
    useCallback(() => {
      if (!taskId) return;
      fetchTask(hasLoadedRef.current);
      hasLoadedRef.current = true;
    }, [fetchTask])
  );

  useFocusEffect(
    useCallback(() => {
      if (!taskId || shouldOpenComments !== "1") return;
      const requestKey = openCommentsRequestId ?? `${taskId}:${commentId ?? ""}`;
      if (consumedOpenCommentsRef.current === requestKey) return;
      consumedOpenCommentsRef.current = requestKey;

      let didOpen = false;
      let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
      let transitionTimer: ReturnType<typeof setTimeout> | null = null;
      let navigationTask: CancelableNavigationTask | null = null;

      const openCommentsSheet = () => {
        if (didOpen) return;
        didOpen = true;
        navigationTask = runAfterNavigationFrame(() => {
          const commentQuery = commentId ? `?commentId=${encodeURIComponent(commentId)}` : "";
          router.push(`${pathname}/comments${commentQuery}`);
        });
      };

      const unsubscribe = (navigation as unknown as {
        addListener: (
          eventName: "transitionEnd",
          listener: (event: { data?: { closing?: boolean } }) => void
        ) => () => void;
      }).addListener("transitionEnd", (event) => {
        if (event.data?.closing) return;
        transitionTimer = setTimeout(openCommentsSheet, 80);
      });

      fallbackTimer = setTimeout(openCommentsSheet, 800);

      return () => {
        unsubscribe();
        if (fallbackTimer) clearTimeout(fallbackTimer);
        if (transitionTimer) clearTimeout(transitionTimer);
        navigationTask?.cancel();
      };
    }, [commentId, navigation, openCommentsRequestId, pathname, router, shouldOpenComments, taskId])
  );

  const handleOpenComments = () => {
    router.navigate(`${pathname}/comments`);
  };

  const handleDelete = () => {
    if (!task) return;
    Alert.alert("Slet opgave", "Er du sikker på, at du vil slette denne opgave? Dette kan ikke fortrydes.", [
      { text: "Annuller", style: "cancel" },
      {
        text: "Slet",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTask(task.task_id);
            router.dismissAll();
          } catch {
            Alert.alert("Fejl", "Kunne ikke slette opgaven");
          }
        },
      },
    ]);
  };

  const handleReject = () => {
    if (!task) return;
    Alert.alert("Afvis opgave", "Er du sikker på, at du vil afvise denne opgave?", [
      { text: "Annuller", style: "cancel" },
      {
        text: "Afvis",
        style: "destructive",
        onPress: async () => {
          try {
            await updateTask(task.task_id, { status: TaskStatus.REJECTED });
            router.back();
          } catch {
            Alert.alert("Fejl", "Kunne ikke afvise opgaven");
          }
        },
      },
    ]);
  };

  const isArchived = task?.status === TaskStatus.ARCHIVED;

  const menuActions = isAdminRole(user?.role)
    ? [
      ...(!isArchived ? [{ label: "Rediger", systemImage: "pencil" as const, onPress: () => router.push(`${pathname}/edit`), disabled: !task }] : []),
      ...(!!task ? [{ label: "Slet", systemImage: "trash" as const, onPress: handleDelete, role: "destructive" as const }] : []),
    ]
    : isArchived
      ? []
      : [
        { label: "Afvis", systemImage: "xmark" as const, onPress: handleReject, role: "destructive" as const, disabled: !task },
      ];

  const handleComplete = async () => {
    if (!task) return;
    try {
      setIsUpdating(true);
      const newStatus = task.status === TaskStatus.DONE ? TaskStatus.PENDING : TaskStatus.DONE;
      const updated = await updateTask(task.task_id, { status: newStatus });
      setTask(updated);
      if (newStatus === TaskStatus.DONE) {
        router.back();
      }
    } catch {
      Alert.alert("Fejl", "Kunne ikke opdatere opgave");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddProgress = async (value: string) => {
    if (!task || !user) return;
    try {
      setIsUpdating(true);
      const isAssigned = task.assigned_users?.includes(user.user_id) ?? false;
      const canSelfAssign = user.role === UserRole.ADMIN && !!user.organization_id && !isAssigned;
      if (canSelfAssign) {
        const updated = await updateTask(task.task_id, {
          assigned_users: [...(task.assigned_users ?? []), user.user_id],
        });
        setTask(updated);
      }
      await addTaskProgress(task.task_id, {
        quantity_done: Number(value),
        unit: task.goal?.unit || undefined,
      });
      await fetchTask();
    } catch {
      Alert.alert("Fejl", "Kunne ikke registrere fremskridt");
    } finally {
      setIsUpdating(false);
    }
  };

  const unitLabel = task ? translateTaskUnit(task.goal?.unit) : "";
  const currentQuantity = task?.goal?.current_quantity ?? 0;
  const hasProgress = !!task?.goal;
  const progressPct = task?.goal?.target_quantity
    ? Math.min(100, Math.round((currentQuantity / task.goal.target_quantity) * 100))
    : null;

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <TaskDetailsHeader
        title={task?.title}
        path={task?.project?.name}
        taskId={taskId}
        menuActions={menuActions}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 56 + 24, paddingBottom: insets.bottom + 24, paddingHorizontal: 20 }}
      >
        {isLoading && (
          <View className="items-center justify-center py-20">
            <ActivityIndicator color={colors.green} size="large" />
            <Text className="body-sm mt-3">Henter opgave...</Text>
          </View>
        )}

        {error && !isLoading && (
          <View className="bg-danger-surface border border-danger-border rounded-lg p-4 gap-3">
            <Text className="body-sm text-danger-text text-center">{error}</Text>
            <TouchableOpacity
              onPress={() => fetchTask()}
              className="self-center px-4 py-2 rounded-lg bg-danger-text"
            >
              <Text className="btn-md text-white">Prøv igen</Text>
            </TouchableOpacity>
          </View>
        )}

        {task && !isLoading && !error && isArchived && (
          <View className="flex-row items-center gap-2 bg-muted border border-border rounded-[10px] px-3 py-2.5 mb-1">
            <Lock size={14} color={colors.textSecondary} strokeWidth={2.2} />
            <Text className="label-sm text-secondary">Denne opgave er arkiveret og kan ikke redigeres</Text>
          </View>
        )}

        {task && !isLoading && !error && (
          <View className="flex-1 justify-between gap-4">
            <View className="gap-4">
              <Text className="h2">{task.title}</Text>

              {/* Badges */}
              <View className="flex-row flex-wrap gap-2">
                <Badge variant="status" value={task.status} size="md" />
                {task.priority && <Badge variant="priority" value={task.priority} size="md" />}
                {task.recurring_template_id && <RecurringBadge size="md" />}
              </View>

              {creator?.name && (
                <View className="flex-row items-center gap-3">
                  <SingleAvatar name={creator.name} imageUrl={creator.profile_picture_url} size="lg" />
                  <View>
                    <Text className="label-md mb-0.5">
                      Oprettet af {creator.name}
                    </Text>
                    <Text className="body-xs">
                      {task.created_at ? formatRelativeDate(task.created_at) : ""}
                    </Text>
                  </View>
                </View>
              )}

              <View className="flex-row items-center flex-wrap gap-x-3.5 gap-y-1.5">
                <View className="flex-row items-center gap-1">
                  <Calendar size={13} color={colors.textMuted} strokeWidth={2.2} />
                  <Text className="body-xs">
                    Start {task.start_date ? formatRelativeDate(task.start_date) : "ikke sat"}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Clock size={13} color={colors.textMuted} strokeWidth={2.2} />
                  <Text className="body-xs">
                    Deadline {task.deadline ? formatRelativeDate(task.deadline) : "ikke sat"}
                  </Text>
                </View>
              </View>

              {hasProgress && progressPct !== null && (
                <TaskProgressCard
                  progressPct={progressPct}
                  unitLabel={unitLabel}
                  currentQuantity={currentQuantity}
                  targetQuantity={task.goal!.target_quantity}
                  onAddProgress={handleAddProgress}
                  isUpdating={isUpdating}
                  disabled={isArchived}
                />
              )}

              <View className="gap-2">
                <Text className="overline">Beskrivelse</Text>
                <Text className="body-sm" style={{ lineHeight: 22 }}>
                  {task.description}
                </Text>
              </View>
            </View>

            {!isArchived && (
              <SlideToComplete
                onComplete={handleComplete}
                isCompleted={task.status === TaskStatus.DONE}
                isUpdating={isUpdating}
              />
            )}
          </View>
        )}
      </ScrollView>

      {task && !isLoading && !error && (
        <View className="absolute right-5 bottom-10 items-end gap-2.5">
          <GlassIconButton icon={Camera} onPress={() => router.navigate(`${pathname}/photos`)} size="lg" />
          <GlassIconButton icon={MessageCircle} onPress={handleOpenComments} size="lg" />
          <GlassIconButton icon={Folder} onPress={() => router.navigate(`${pathname}/files`)} size="lg" />
        </View>
      )}
    </View>
  );
}
