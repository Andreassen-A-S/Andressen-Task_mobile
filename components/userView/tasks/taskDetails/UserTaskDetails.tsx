import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Task, TaskGoalType, TaskStatus } from "@/types/task";
import { User } from "@/types/users";
import { addTaskProgress, getTask, updateTask, getUser } from "@/lib/api";
import {
  formatDaDate,
  getPriorityAccentColor,
  translatePriority,
  translateTaskUnit,
  translateStatus,
  getPriorityColors,
  getStatusColors,
} from "@/helpers/helpers";
import { Ionicons } from "@expo/vector-icons";
import UserTaskComment from "./UserTaskComment";

interface Props {
  taskId: string;
  onBack: () => void;
}

export default function UserTaskDetails({ taskId, onBack }: Props) {
  const [task, setTask] = useState<Task | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [progressDelta, setProgressDelta] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;
    const fetchTask = async () => {
      try {
        setError(null)
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
    } catch {
      Alert.alert("Fejl", "Kunne ikke opdatere opgave");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddProgress = async () => {
    if (!task) return;
    const delta = Number(progressDelta);
    if (!Number.isFinite(delta) || delta <= 0) {
      Alert.alert("Ugyldigt", "Indtast et gyldigt fremskridt over 0");
      return;
    }
    try {
      setIsUpdating(true);
      await addTaskProgress(task.task_id, {
        quantity_done: delta,
        unit: task.unit || undefined,
      });
      const updated = await getTask(task.task_id);
      setTask(updated);
      setProgressDelta("");
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
  const progressLabel = task?.target_quantity
    ? `${currentQuantity} / ${task.target_quantity}${unitLabel ? ` ${unitLabel}` : ""}`
    : `${currentQuantity}${unitLabel ? ` ${unitLabel}` : ""}`;

  return (
    <View className="flex-1 bg-white rounded-t-3xl">
      {/* Handle */}
      <View className="items-center pt-3 pb-2">
        <View className="w-9 h-1 rounded-full bg-[#E8E6E1]" />
      </View>

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3">
        {isLoading ? (
          <Text className="text-xs text-[#9DA1B4] uppercase font-bold tracking-widest">HENTER...</Text>
        ) : error ? (
          <Text className="text-xs text-red-500 uppercase font-bold tracking-widest">FEJL</Text>
        ) : task ? (
          (() => {
            const statusColors = getStatusColors(task.status);
            return (
              <View style={[{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 }, statusColors.container]}>
                <Text style={[{ fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }, statusColors.text]}>
                  {translateStatus(task.status)}
                </Text>
              </View>
            );
          })()
        ) : null}

        <TouchableOpacity
          onPress={onBack}
          className="w-8 h-8 border border-gray-200 rounded-lg items-center justify-center"
        >
          <Ionicons name="close" size={16} color="#6B7084" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {isLoading && (
          <View className="items-center justify-center py-20">
            <ActivityIndicator color="#0f6e56" size="large" />
            <Text className="text-sm text-gray-400 mt-3">Henter opgave...</Text>
          </View>
        )}

        {error && !isLoading && (
          <View className="bg-red-50 border border-red-300 rounded-lg p-4 my-4">
            <Text className="text-red-600 text-sm text-center">{error}</Text>
          </View>
        )}

        {task && !isLoading && !error && (
          <View>
            {/* Priority badge */}
            <View className="flex-row items-center gap-2 mb-3">
              {(() => {
                const priorityColors = getPriorityColors(task.priority);
                return (
                  <View style={[{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 }, priorityColors.container]}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: getPriorityAccentColor(task.priority) }} />
                    <Text style={[{ fontSize: 11, fontWeight: "700" }, priorityColors.text]}>{translatePriority(task.priority)} prioritet</Text>
                  </View>
                );
              })()}
              {task.recurring_template_id && (
                <View className="px-2 py-1 rounded-md bg-purple-100 border border-purple-200">
                  <Text className="text-xs font-bold text-purple-600 uppercase">GENTAGET</Text>
                </View>
              )}
            </View>

            {/* Title */}
            <Text className="text-xl font-bold text-[#1B1D22] mb-2">{task.title}</Text>

            {/* Description */}
            {task.description ? (
              <Text className="text-sm text-[#6B7084] mb-5 leading-relaxed">{task.description}</Text>
            ) : null}

            {/* Progress */}
            {hasProgress && (
              <View className="mb-4">
                <Text className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Fremskridt
                </Text>
                <View className="flex-row items-baseline justify-between mb-1.5">
                  <Text className="text-base font-semibold text-[#1B1D22]">{progressLabel}</Text>
                  {progressPct !== null && (
                    <Text className="text-sm text-[#9DA1B4]">{progressPct}%</Text>
                  )}
                </View>
                <View className="h-2 rounded-full bg-[#E8E6E1] overflow-hidden mb-4">
                  <View
                    className="h-full rounded-full bg-[#0f6e56]"
                    style={{ width: `${progressPct ?? 0}%` }}
                  />
                </View>
                <TextInput
                  keyboardType="numeric"
                  placeholder={`+ Tilføj ${unitLabel || "enheder"}`}
                  placeholderTextColor="#9DA1B4"
                  value={progressDelta}
                  onChangeText={setProgressDelta}
                  className="h-11 rounded-lg border border-[#E8E6E1] px-3.5 bg-[#F6F5F1] text-sm text-[#1B1D22] mb-2"
                />
                <TouchableOpacity
                  onPress={handleAddProgress}
                  disabled={isUpdating}
                  className="h-11 rounded-lg bg-[#0f6e56] items-center justify-center disabled:opacity-50"
                >
                  {isUpdating ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-semibold">Registrer fremskridt</Text>
                  )}
                </TouchableOpacity>
                <View className="h-px bg-[#E8E6E1] my-4" />
              </View>
            )}

            {/* Comments */}
            <UserTaskComment taskId={taskId} />

            <View className="h-6" />
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      {task && !isLoading && !error && (
        <View className="px-5 pb-8 pt-2 border-t border-[#E8E6E1]">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs text-[#9DA1B4]">
              Oprettet af: {creator?.name || creator?.email || task.created_by}
            </Text>
            <Text className="text-xs text-[#9DA1B4]">{formatDaDate(task.created_at)}</Text>
          </View>

          <TouchableOpacity
            onPress={handleComplete}
            disabled={isUpdating}
            className="h-14 rounded-xl bg-[#0f6e56] flex-row items-center justify-center gap-2 disabled:opacity-50"
          >
            {isUpdating ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="white" />
                <Text className="text-white font-semibold text-base">
                  {task.status === "DONE" ? "Marker som ikke færdig" : "Marker som færdig"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
