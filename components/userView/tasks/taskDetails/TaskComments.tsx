import { useState, useCallback, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useKeyboardHandler } from "react-native-keyboard-controller";
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
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);
  const isNearBottomRef = useRef(true);

  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const keyboardHeight = useSharedValue(0);

  useKeyboardHandler({
    onMove: (e) => {
      "worklet";
      keyboardHeight.value = e.height;
    },
    onInteractive: (e) => {
      "worklet";
      keyboardHeight.value = e.height;
    },
  }, []);

  const spacerStyle = useAnimatedStyle(() => ({
    height: keyboardHeight.value || insets.bottom,
  }));

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const data = await getTaskComments(taskId);
      setComments(data);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 50);
      const uniqueIds = [...new Set(data.map((c) => c.user_id))];
      const authors: Record<string, User> = {};
      await Promise.all(uniqueIds.map(async (id) => {
        try { authors[id] = await getUser(id); } catch { }
      }));
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
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color={colors.green} size="large" />
          </View>
        ) : fetchError ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
            <View style={{ borderRadius: 12, padding: 16, width: "100%", alignItems: "center", borderWidth: 1, backgroundColor: colors.redLight, borderColor: colors.redBorder }}>
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
            keyboardShouldPersistTaps="handled"
            onLayout={() => { if (isNearBottomRef.current) flatListRef.current?.scrollToEnd({ animated: false }); }}
            onScroll={(e) => {
              const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
              isNearBottomRef.current = contentSize.height - layoutMeasurement.height - contentOffset.y < 80;
            }}
            scrollEventThrottle={100}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "flex-end",
              paddingTop: headerHeight + 16,
              paddingHorizontal: 16,
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: "center" }}>
                <Text style={[typography.bodySm, { color: colors.textMuted, textAlign: "center" }]}>
                  Ingen kommentarer endnu.{"\n"}Skriv den første!
                </Text>
              </View>
            }
            renderItem={({ item }) =>
              currentUser?.user_id === item.user_id
                ? <OwnUserTaskCommentBubble comment={item} onDelete={handleDelete} />
                : <UserTaskCommentBubble comment={item} author={commentAuthors[item.user_id]} />
            }
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}

        {inlineError && (
          <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.redLight }}>
            <Text style={[typography.bodyXs, { color: colors.redText, textAlign: "center" }]}>{inlineError}</Text>
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.white }}>
          <TextInput
            ref={inputRef}
            value={input}
            onChangeText={setInput}
            placeholder="Besked..."
            placeholderTextColor={colors.textMuted}
            multiline
            autoCorrect
            autoCapitalize="sentences"
            style={[typography.bodyMd, { flex: 1, maxHeight: 100, backgroundColor: colors.muted, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }]}
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!input.trim() || isSubmitting}
            style={{ width: 37, height: 37, borderRadius: 20, marginBottom: 2, opacity: !input.trim() || isSubmitting ? 0.4 : 1, backgroundColor: input.trim() ? colors.green : colors.muted, alignItems: "center", justifyContent: "center" }}
          >
            {isSubmitting
              ? <ActivityIndicator color={colors.white} size="small" />
              : <Ionicons name="arrow-up" size={18} color={input.trim() ? colors.white : colors.textMuted} />
            }
          </TouchableOpacity>
        </View>
        <Animated.View style={spacerStyle} />
      </View>
    </ModalScreen>
  );
}
