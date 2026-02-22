import { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Task, TaskGoalType, TaskStatus } from "@/types/task";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import { addTaskProgress, getTask, updateTask, getUser, getTaskComments, createComment, deleteComment } from "@/lib/api";
import {
  formatDaDate,
  translateTaskUnit,
} from "@/helpers/helpers";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/contexts/AuthContext";
import UserTaskComment from "./UserTaskComment";
import { typography } from "@/constants/typography";
import CloseButton from "../../common/buttons/CloseButton";
import RecurringBadge from "../../common/label/recurringBadge";
import Badge from "../../common/label/badge";
import DetailsPriorityBadge from "../../common/label/DetailsPriorityBadge";
import { colors } from "@/constants/colors";

interface Props {
  taskId: string;
  onBack: () => void;
  onTaskUpdated?: () => void;
}

export default function UserTaskDetails({ taskId, onBack, onTaskUpdated }: Props) {
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;

  const [task, setTask] = useState<Task | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [progressDelta, setProgressDelta] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, User>>({});
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const handleCommentFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

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

  useEffect(() => {
    if (!taskId) return;
    const fetchComments = async () => {
      try {
        setIsLoadingComments(true);
        setCommentError(null);
        const commentsData = await getTaskComments(taskId);
        setComments(commentsData);

        const uniqueUserIds = [...new Set(commentsData.map((c) => c.user_id))];
        const authorsData: Record<string, User> = {};
        await Promise.all(
          uniqueUserIds.map(async (userId) => {
            try {
              authorsData[userId] = await getUser(userId);
            } catch { }
          }),
        );
        setCommentAuthors(authorsData);
      } catch {
        setCommentError("Kunne ikke hente kommentarer");
      } finally {
        setIsLoadingComments(false);
      }
    };
    fetchComments();
  }, [taskId]);

  const handleComplete = async () => {
    if (!task) return;
    try {
      setIsUpdating(true);
      const newStatus = task.status === TaskStatus.DONE ? TaskStatus.PENDING : TaskStatus.DONE;
      const updated = await updateTask(task.task_id, { status: newStatus });
      setTask(updated);
      if (newStatus === TaskStatus.DONE) {
        onBack();
        onTaskUpdated?.();
      }
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

  const handleSubmitComment = async () => {
    if (!commentInput.trim()) return;
    try {
      setIsSubmittingComment(true);
      const newComment = await createComment(taskId, { message: commentInput.trim() });
      setComments((prev) => [...prev, newComment]);
      if (currentUser && !commentAuthors[newComment.user_id]) {
        try {
          const userData = await getUser(newComment.user_id);
          setCommentAuthors((prev) => ({ ...prev, [newComment.user_id]: userData }));
        } catch (err) {
          setCommentError("Kunne ikke hente forfatterdata for kommentar");
        }
      }
      setCommentInput("");
      setCommentError(null);
    } catch {
      setCommentError("Kunne ikke tilføje kommentar");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setCommentError(null);
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.comment_id !== commentId));
    } catch {
      setCommentError("Kunne ikke slette kommentar");
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
          <Text className="tracking-widest" style={typography.bodyXs}>HENTER...</Text>
        ) : error ? (
          <Text className="tracking-widest" style={[typography.bodyXs, { color: colors.red }]}>FEJL</Text>
        ) : task ? (
          <Badge variant="status" value={task.status} size="lg" />
        ) : null}

        <CloseButton onClick={onBack} />
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, }}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {isLoading && (
            <View className="items-center justify-center py-20">
              <ActivityIndicator color="#0f6e56" size="large" />
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
              {/* Priority badge */}
              <View className="flex-row items-center gap-2 mb-3">
                <DetailsPriorityBadge priority={task.priority} size="lg" />
                {task.recurring_template_id && <RecurringBadge size="lg" />}
              </View>

              {/* Title */}
              <Text className="mb-2" style={typography.h3}>{task.title}</Text>

              {/* Description */}
              {task.description ? (
                <Text className="mb-5 leading-relaxed" style={typography.bodySm}>{task.description}</Text>
              ) : null}

              {/* Progress */}
              {hasProgress && (
                <>
                  <Text className="mb-2" style={typography.overline}>
                    Fremskridt
                  </Text>
                  <View className="flex-row items-baseline justify-between mb-1.5">
                    <Text style={typography.monoMd}>{progressLabel}</Text>
                    {progressPct !== null && (
                      <Text style={typography.monoMd}>{progressPct}%</Text>
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
                    className="h-12 rounded-lg border border-[#E8E6E1] px-3.5 bg-[#F6F5F1] mb-2 focus:border-[#2D9F6F]"
                    style={typography.monoSm}
                  />
                  <TouchableOpacity
                    onPress={handleAddProgress}
                    disabled={isUpdating}
                    className="h-12 rounded-lg bg-[#0f6e56] items-center justify-center disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={typography.btnMdWhite}>Registrer fremskridt</Text>
                    )}
                  </TouchableOpacity>
                  <View className="h-px bg-[#E8E6E1] my-4" />
                </>
              )}

              {/* Comments */}
              <UserTaskComment
                comments={comments}
                commentAuthors={commentAuthors}
                isLoading={isLoadingComments}
                error={commentError}
                currentUserId={currentUser?.user_id}
                onDelete={handleDeleteComment}
                commentInput={commentInput}
                onCommentChange={setCommentInput}
                onSubmit={handleSubmitComment}
                isSubmitting={isSubmittingComment}
                onInputFocus={handleCommentFocus}
              />

              <View className="h-6" />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer — always fixed at bottom */}
      {task && !isLoading && !error && (
        <View className="px-5 pb-8 pt-3 border-t border-[#E8E6E1]">
          <View className="flex-row items-center justify-between mb-3">
            <Text style={typography.monoXs}>
              Oprettet af: {creator?.name || creator?.email || task.created_by}
            </Text>
            <Text style={typography.monoXs}>{formatDaDate(task.created_at)}</Text>
          </View>

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
      )}
    </View>
  );
}
