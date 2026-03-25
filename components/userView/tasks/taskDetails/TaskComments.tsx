import { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "@/contexts/AuthContext";
import { getTaskComments, createComment, deleteComment, getUser } from "@/lib/api";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import TaskDetailsHeader from "./TaskDetailsHeader";
import UserTaskComment from "./UserTaskComment";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  taskId: string;
}

export default function TaskComments({ taskId }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;

  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getTaskComments(taskId);
      setComments(data);
      const uniqueIds = [...new Set(data.map((c) => c.user_id))];
      const authors: Record<string, User> = {};
      await Promise.all(
        uniqueIds.map(async (id) => {
          try { authors[id] = await getUser(id); } catch {}
        })
      );
      setCommentAuthors(authors);
    } catch {
      setError("Kunne ikke hente kommentarer");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useFocusEffect(useCallback(() => { fetchComments(); }, [fetchComments]));

  const handleSubmit = async () => {
    if (!input.trim()) return;
    try {
      setIsSubmitting(true);
      const newComment = await createComment(taskId, { message: input.trim() });
      setComments((prev) => [...prev, newComment]);
      if (!commentAuthors[newComment.user_id]) {
        try {
          const user = await getUser(newComment.user_id);
          setCommentAuthors((prev) => ({ ...prev, [newComment.user_id]: user }));
        } catch {}
      }
      setInput("");
    } catch {
      setError("Kunne ikke tilføje kommentar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.comment_id !== commentId));
    } catch {
      setError("Kunne ikke slette kommentar");
    }
  };

  return (
    <View className="flex-1 bg-[#F6F5F1]">
      <Stack.Screen options={{ headerShown: false }} />
      <TaskDetailsHeader title="Kommentarer" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.green} size="large" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text style={typography.bodySm} className="text-red-500 text-center">{error}</Text>
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.comment_id}
            contentContainerStyle={{ paddingTop: insets.top + 56 + 12, paddingBottom: 12, paddingHorizontal: 20 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Text style={typography.bodySm} className="text-gray-400">Ingen kommentarer endnu</Text>
              </View>
            }
            renderItem={({ item }) => (
              <UserTaskComment
                comment={item}
                author={commentAuthors[item.user_id]}
                currentUserId={currentUser?.user_id}
                onDelete={handleDelete}
              />
            )}
          />
        )}

        {/* Input bar */}
        <View
          className="flex-row items-center gap-3 px-4 py-3 bg-white border-t border-[#E8E6E1]"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Skriv en kommentar..."
            multiline
            autoCorrect
            autoCapitalize="sentences"
            style={[typography.bodyMd, { flex: 1, maxHeight: 100 }]}
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!input.trim() || isSubmitting}
            className="disabled:opacity-40"
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.green} size="small" />
            ) : (
              <Text style={[typography.labelLg, { color: colors.green }]}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
