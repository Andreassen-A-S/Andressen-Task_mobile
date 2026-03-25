import { useState, useCallback, useContext, useRef, useEffect } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "@/contexts/AuthContext";
import { getTaskComments, createComment, deleteComment, getUser } from "@/lib/api";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import ModalScreen from "@/components/userView/common/ModalScreen";
import OwnUserTaskCommentBubble from "./OwnUserTaskCommentBubble";
import UserTaskCommentBubble from "./UserTaskCommentBubble";

interface Props {
  taskId: string;
}

export default function TaskComments({ taskId }: Props) {
  const insets = useSafeAreaInsets();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

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
          try { authors[id] = await getUser(id); } catch { }
        })
      );
      setCommentAuthors(authors);
    } catch {
      setError("Kunne ikke hente kommentarer");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useFocusEffect(useCallback(() => {
    fetchComments();
    // Open keyboard on arrival
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, [fetchComments]));

  // Scroll to bottom when comments load
  useEffect(() => {
    if (!isLoading && comments.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [isLoading]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    try {
      setIsSubmitting(true);
      const newComment = await createComment(taskId, { message: input.trim() });
      if (!commentAuthors[newComment.user_id]) {
        try {
          const user = await getUser(newComment.user_id);
          setCommentAuthors((prev) => ({ ...prev, [newComment.user_id]: user }));
        } catch { }
      }
      setComments((prev) => [...prev, newComment]);
      setInput("");
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
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
    <ModalScreen title="Kommentarer">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.green} size="large" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={comments}
            keyExtractor={(item) => item.comment_id}
            contentContainerStyle={{
              paddingTop: 56 + 16,
              paddingBottom: 16,
              paddingHorizontal: 16,
              flexGrow: 1,
              justifyContent: comments.length === 0 ? "center" : "flex-start",
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center">
                <Text style={[typography.bodySm, { color: colors.textMuted, textAlign: "center" }]}>
                  Ingen kommentarer endnu.{"\n"}Skriv den første!
                </Text>
              </View>
            }
            renderItem={({ item }) =>
              currentUser?.user_id === item.user_id ? (
                <OwnUserTaskCommentBubble comment={item} onDelete={handleDelete} />
              ) : (
                <UserTaskCommentBubble comment={item} author={commentAuthors[item.user_id]} />
              )
            }
            ItemSeparatorComponent={() => <View className="h-2" />}
          />
        )}

        {/* Input bar */}
        <View
          className="flex-row items-end gap-2 px-4 py-3"
          style={{ paddingBottom: insets.bottom + 8, backgroundColor: colors.white }}
        >
          <TextInput
            ref={inputRef}
            value={input}
            onChangeText={setInput}
            placeholder="Besked..."
            placeholderTextColor={colors.textMuted}
            multiline
            autoCorrect
            autoCapitalize="sentences"
            style={[
              typography.bodyMd,
              {
                flex: 1,
                maxHeight: 100,
                backgroundColor: colors.muted,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8,
              },
            ]}
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!input.trim() || isSubmitting}
            className="mb-1 disabled:opacity-40"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: input.trim() ? colors.green : colors.muted,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Ionicons name="arrow-up" size={18} color={input.trim() ? colors.white : colors.textMuted} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ModalScreen>
  );
}
