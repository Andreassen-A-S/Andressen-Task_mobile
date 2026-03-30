import { useState, useCallback, useContext, useRef } from "react";
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
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "@/contexts/AuthContext";
import { getTaskComments, createComment, deleteComment, getUser } from "@/lib/api";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import OwnUserTaskCommentBubble from "./OwnUserTaskCommentBubble";
import UserTaskCommentBubble from "./UserTaskCommentBubble";

export default function TaskComments() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const insets = useSafeAreaInsets();
  const headerHeight = useModalHeaderHeight();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const data = await getTaskComments(taskId);
      setComments(data);
      if (data.length > 0) {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
      }
      const uniqueIds = [...new Set(data.map((c) => c.user_id))];
      const authors: Record<string, User> = {};
      await Promise.all(
        uniqueIds.map(async (id) => {
          try { authors[id] = await getUser(id); } catch { }
        })
      );
      setCommentAuthors(authors);
    } catch {
      setFetchError("Kunne ikke hente kommentarer");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useFocusEffect(useCallback(() => {
    fetchComments();
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, [fetchComments]));

  const handleSubmit = async () => {
    if (!input.trim()) return;
    try {
      setIsSubmitting(true);
      setInlineError(null);
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
      setInlineError("Kunne ikke tilføje kommentar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      setInlineError(null);
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.comment_id !== commentId));
    } catch {
      setInlineError("Kunne ikke slette kommentar");
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
        ) : fetchError ? (
          <View className="flex-1 items-center justify-center px-6">
            <View className="rounded-xl p-4 w-full items-center border" style={{ backgroundColor: colors.redLight, borderColor: colors.redBorder }}>
              <Text style={[typography.bodySm, { color: colors.redText, textAlign: "center", marginBottom: 12 }]}>{fetchError}</Text>
              <TouchableOpacity onPress={fetchComments} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.red }}>
                <Text style={typography.btnMdWhite}>Prøv igen</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={comments}
            keyExtractor={(item) => item.comment_id}
            contentContainerStyle={{
              paddingTop: headerHeight + 16,
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

        {inlineError && (
          <View className="px-4 py-2" style={{ backgroundColor: colors.redLight }}>
            <Text style={[typography.bodyXs, { color: colors.redText, textAlign: "center" }]}>{inlineError}</Text>
          </View>
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
