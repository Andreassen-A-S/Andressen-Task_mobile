import { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";
import { Task, TaskGoalType, TaskStatus, TaskUnit } from "@/types/task";
import { User } from "@/types/users";
import { addTaskProgress, getTask, updateTask, getUser } from "@/lib/api";
import { formatRelativeDate, translateTaskUnit } from "@/helpers/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "@/contexts/AuthContext";
import TaskProgressCard from "./TaskProgressCard";
import TaskDetailsHeader from "./TaskDetailsHeader";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import SingleAvatar from "../../common/label/singleAvatar";

interface Props {
  taskId: string;
}

export default function UserTaskDetails({ taskId }: Props) {
  const insets = useSafeAreaInsets();
  const authContext = useContext(AuthContext);
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;
    const fetchTask = async () => {
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
    };
    fetchTask();
  }, [taskId]);

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
      const updated = await getTask(task.task_id);
      setTask(updated);
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
    <View className="flex-1 bg-[#F6F5F1]">
      <Stack.Screen options={{ headerShown: false }} />
      <TaskDetailsHeader title={task?.title} />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: insets.top + 56, paddingBottom: 120 }}
      >
        {isLoading && (
          <View className="items-center justify-center py-20">
            <ActivityIndicator color={colors.green} size="large" />
            <Text className="mt-3" style={typography.bodySm}>Henter opgave...</Text>
          </View>
        )}

        {error && !isLoading && (
          <View className="bg-red-50 border border-red-300 rounded-lg p-4 my-4">
            <Text className="text-red-600 text-sm text-center">{error}</Text>
          </View>
        )}

        {task && !isLoading && !error && (
          <View>
            <Text className="mb-4" style={typography.h2}>{task.title}</Text>

            {creator?.name && (
              <View className="flex-row items-center mb-4">
                <SingleAvatar name={creator.name} size="lg" />
                <View className="ml-3">
                  <Text style={[typography.labelMd, { marginBottom: 2 }]}>
                    Oprettet af {creator.name}
                  </Text>
                  <Text style={typography.bodyXs}>
                    {formatRelativeDate(task.created_at)}
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

            <View className="mb-4">
              <Text className="mb-2" style={typography.overline}>Beskrivelse</Text>
              <Text className="leading-relaxed" style={typography.bodySm}>
                {task.description}
              </Text>
            </View>

            <View className="mt-4">
              <TouchableOpacity
                onPress={handleComplete}
                disabled={isUpdating}
                className={`h-14 rounded-lg flex-row items-center justify-center gap-2 disabled:opacity-50 ${task.status === TaskStatus.DONE ? "bg-[#9DA1B4]" : "bg-[#0f6e56]"}`}
              >
                {isUpdating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons
                      name={task.status === TaskStatus.DONE ? "refresh" : "checkmark"}
                      size={20}
                      color="white"
                    />
                    <Text style={typography.btnMdWhite}>
                      {task.status === TaskStatus.DONE ? "Marker som ikke færdig" : "Marker som færdig"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {task && !isLoading && !error && (
        <View style={{ position: "absolute", right: 20, bottom: 40, alignItems: "flex-end", gap: 10 }}>
          <GlassIconButton systemName="camera" onPress={() => router.push(`/(tabs)/tasks/${taskId}/photos`)} variant="lg" />
          <GlassIconButton systemName="bubble.right" onPress={() => router.push(`/(tabs)/tasks/${taskId}/comments`)} variant="lg" />
          <GlassIconButton systemName="folder" onPress={() => router.push(`/(tabs)/tasks/${taskId}/files`)} variant="lg" />
        </View>
      )}
    </View>
  );
}
