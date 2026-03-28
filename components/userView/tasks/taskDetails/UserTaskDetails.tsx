import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";
import { Task, TaskGoalType, TaskStatus, TaskUnit } from "@/types/task";
import { User } from "@/types/users";
import { addTaskProgress, getTask, updateTask, getUser } from "@/lib/api";
import { formatRelativeDate, translateTaskUnit } from "@/helpers/helpers";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TaskDetailsHeader from "./TaskDetailsHeader";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import SingleAvatar from "../../common/label/singleAvatar";
import Badge from "../../common/label/badge";
import RecurringBadge from "../../common/label/recurringBadge";
import SlideToComplete from "../../common/SlideToComplete";
import TaskProgressCard from "./TaskProgressCard";

export default function UserTaskDetails() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const taskData = await getTask(taskId);
      setTask(taskData);
      if (taskData.created_by) {
        try {
          setCreator(await getUser(taskData.created_by));
        } catch { }
      }
    } catch {
      setError("Kunne ikke hente opgave detaljer");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (!taskId) return;
    fetchTask();
  }, [fetchTask]);

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
    if (!task) return;
    try {
      setIsUpdating(true);
      await addTaskProgress(task.task_id, {
        quantity_done: Number(value),
        unit: task.unit || undefined,
      });
      await fetchTask();
    } catch {
      Alert.alert("Fejl", "Kunne ikke registrere fremskridt");
    } finally {
      setIsUpdating(false);
    }
  };

  const unitLabel = task ? translateTaskUnit(task.unit) : "";
  const currentQuantity = task?.current_quantity ?? 0;
  const hasProgress = task?.current_quantity != null && task?.goal_type === TaskGoalType.FIXED;
  const progressPct = task?.target_quantity
    ? Math.min(100, Math.round((currentQuantity / task.target_quantity) * 100))
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.eggWhite }}>
      <Stack.Screen options={{ headerShown: false }} />
      <TaskDetailsHeader title={task?.title} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 56 + 24, paddingBottom: insets.bottom + 24, paddingHorizontal: 20 }}
      >
        {isLoading && (
          <View className="items-center justify-center py-20">
            <ActivityIndicator color={colors.green} size="large" />
            <Text className="mt-3" style={typography.bodySm}>Henter opgave...</Text>
          </View>
        )}

        {error && !isLoading && (
          <View style={{ backgroundColor: colors.redLight, borderWidth: 1, borderColor: colors.redBorder, borderRadius: 8, padding: 16, gap: 12 }}>
            <Text style={[typography.bodySm, { color: colors.redText, textAlign: "center" }]}>{error}</Text>
            <TouchableOpacity
              onPress={fetchTask}
              style={{ alignSelf: "center", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.redText }}
            >
              <Text style={[typography.btnMd, { color: colors.white }]}>Prøv igen</Text>
            </TouchableOpacity>
          </View>
        )}

        {task && !isLoading && !error && (
          <View style={{ flex: 1, justifyContent: "space-between", gap: 16 }}>
            <View style={{ gap: 16 }}>
              <Text style={typography.h2}>{task.title}</Text>

              {/* Badges */}
              <View className="flex-row flex-wrap gap-2">
                <Badge variant="status" value={task.status} size="md" />
                {task.priority && <Badge variant="priority" value={task.priority} size="md" />}
                {task.recurring_template_id && <RecurringBadge size="md" />}
              </View>

              {creator?.name && (
                <View className="flex-row items-center gap-3">
                  <SingleAvatar name={creator.name} size="lg" />
                  <View>
                    <Text style={[typography.labelMd, { marginBottom: 2 }]}>
                      Oprettet af {creator.name}
                    </Text>
                    <Text style={typography.bodyXs}>
                      {task.created_at ? formatRelativeDate(task.created_at) : ""}
                    </Text>
                  </View>
                </View>
              )}

              {hasProgress && progressPct !== null && (
                <TaskProgressCard
                  progressPct={progressPct}
                  unitLabel={unitLabel}
                  onAddProgress={handleAddProgress}
                  isUpdating={isUpdating}
                />
              )}

              <View style={{ gap: 8 }}>
                <Text style={typography.overline}>Beskrivelse</Text>
                <Text style={[typography.bodySm, { lineHeight: 22 }]}>
                  {task.description}
                </Text>
              </View>
            </View>

            {/* <TouchableOpacity
              onPress={handleComplete}
              disabled={isUpdating}
              style={{ height: 56, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, opacity: isUpdating ? 0.5 : 1, backgroundColor: task.status === TaskStatus.DONE ? colors.textMuted : colors.green }}
            >
              {isUpdating ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons
                    name={task.status === TaskStatus.DONE ? "refresh" : "checkmark"}
                    size={20}
                    color={colors.white}
                  />
                  <Text style={typography.btnMdWhite}>
                    {task.status === TaskStatus.DONE ? "Marker som ikke færdig" : "Marker som færdig"}
                  </Text>
                </>
              )}
            </TouchableOpacity> */}
            <SlideToComplete
              onComplete={handleComplete}
              isCompleted={task.status === TaskStatus.DONE}
              isUpdating={isUpdating}
            />
          </View>
        )}
      </ScrollView>

      {task && !isLoading && !error && (
        <View style={{ position: "absolute", right: 20, bottom: 40, alignItems: "flex-end", gap: 10 }}>
          <GlassIconButton systemName="camera" onPress={() => router.push(`/(tabs)/tasks/${taskId}/photos`)} size="lg" />
          <GlassIconButton systemName="bubble.right" onPress={() => router.push(`/(tabs)/tasks/${taskId}/comments`)} size="lg" />
          <GlassIconButton systemName="folder" onPress={() => router.push(`/(tabs)/tasks/${taskId}/files`)} size="lg" />
        </View>
      )}
    </View>
  );
}
