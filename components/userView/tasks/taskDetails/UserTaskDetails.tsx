import { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";
import { Task, TaskGoalType, TaskStatus, TaskUnit } from "@/types/task";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import { addTaskProgress, getTask, updateTask, getUser, getTaskComments, createComment, deleteComment } from "@/lib/api";
import {
  formatDaDate,
  formatRelativeDate,
  translateTaskUnit,
} from "@/helpers/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "@/contexts/AuthContext";
import UserTaskComment from "./UserTaskComment";
import TaskProgressCard from "./TaskProgressCard";
import TaskDetailsHeader from "./TaskDetailsHeader";
import { typography } from "@/constants/typography";
import RecurringBadge from "../../common/label/recurringBadge";
import Badge from "../../common/label/badge";
import { colors } from "@/constants/colors";
import SingleAvatar from "../../common/label/singleAvatar";

interface Props {
  taskId: string;
}

const TABS = [
  { key: "comments" as const, label: "Kommentarer" },
  { key: "images" as const, label: "Billeder" },
  { key: "files" as const, label: "Filer" },
];

type TabKey = (typeof TABS)[number]["key"];

export default function UserTaskDetails({ taskId }: Props) {
  const insets = useSafeAreaInsets();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, User>>({});
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("comments");
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

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

  const fetchComments = useCallback(async () => {
    if (!taskId) return;
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
  }, [taskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

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
    const delta = Number(value);
    try {
      setIsUpdating(true);
      await addTaskProgress(task.task_id, {
        quantity_done: delta,
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
        } catch { }
      }
      setCommentInput("");
      setCommentError(null);
      setCommentModalVisible(false);
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
  const isPercent = task?.unit === TaskUnit.NONE;
  const currentQuantity = task?.current_quantity ?? 0;
  const hasProgress = task?.current_quantity != null && task?.goal_type === TaskGoalType.FIXED;
  const progressPct = task?.target_quantity
    ? Math.min(100, Math.round((currentQuantity / task.target_quantity) * 100))
    : null;
  const progressLabel = task?.target_quantity
    ? `${currentQuantity} / ${task.target_quantity}${unitLabel ? ` ${unitLabel}` : ""}`
    : `${currentQuantity}${unitLabel ? ` ${unitLabel}` : ""}`;

  return (
    <View className="flex-1 bg-[#F6F5F1]">
      <Stack.Screen options={{ headerShown: false }} />
      <TaskDetailsHeader title={task?.title} />
      {/* Scrollable content */}
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: insets.top + 56, paddingBottom: 120 }}
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
            {/* Title */}
            <Text className="mb-4" style={typography.h2}>{task.title}</Text>

            {/* Author */}
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

            {/* Progress */}
            {hasProgress && progressPct !== null && (
              <TaskProgressCard
                progressPct={progressPct}
                unitLabel={unitLabel}
                onAddProgress={handleAddProgress}
                isUpdating={isUpdating}
              />
            )}

            {/* Description */}
            <View className="mb-4">
              <Text className="mb-2" style={typography.overline}>
                Beskrivelse
              </Text>
              <Text className="leading-relaxed" style={typography.bodySm}>
                {task.description}
              </Text>
            </View>

            {/* Complete button */}
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

      {/* FABs */}
      {task && !isLoading && !error && (
        <View style={{ position: "absolute", right: 20, bottom: 40, alignItems: "flex-end", gap: 10 }}>
          <GlassIconButton systemName="camera" onPress={() => Alert.alert("Foto", "Kommer snart")} variant="lg" />
          <GlassIconButton systemName="bubble.right" onPress={() => setCommentModalVisible(true)} variant="lg" />
          <GlassIconButton systemName="folder" onPress={() => Alert.alert("Filer", "Kommer snart")} variant="lg" />
        </View>
      )}

      {/* Comment modal */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-5 py-3 border-b border-[#E8E6E1]">
            <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
              <Text className="text-2xl text-gray-500">×</Text>
            </TouchableOpacity>
            <Text style={typography.h5}>Ny kommentar</Text>
            <TouchableOpacity
              onPress={handleSubmitComment}
              disabled={!commentInput.trim() || isSubmittingComment}
            >
              {isSubmittingComment ? (
                <ActivityIndicator color={colors.green} size="small" />
              ) : (
                <Text style={[typography.labelLg, { color: colors.green }]}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
          <TextInput
            value={commentInput}
            onChangeText={setCommentInput}
            placeholder="Skriv en kommentar..."
            multiline
            autoFocus
            autoCorrect
            autoCapitalize="sentences"
            style={[typography.bodyMd, { flex: 1, padding: 20, textAlignVertical: "top" }]}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

