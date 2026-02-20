import { useEffect, useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { getTaskComments, createComment, deleteComment, getUser } from "@/lib/api";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import { AuthContext } from "@/contexts/AuthContext";
import UserTaskCommentBubble from "./UserTaskCommentBubble";
import OwnUserTaskCommentBubble from "./OwnUserTaskCommentBubble";

export default function UserTaskComment({ taskId }: { taskId: string }) {
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;

  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!taskId) return;
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const commentsData = await getTaskComments(taskId);
        setComments(commentsData);

        const uniqueUserIds = [...new Set(commentsData.map((c) => c.user_id))];
        const authorsData: Record<string, User> = {};
        await Promise.all(
          uniqueUserIds.map(async (userId) => {
            try {
              authorsData[userId] = await getUser(userId);
            } catch {}
          }),
        );
        setCommentAuthors(authorsData);
      } catch {
        setError("Kunne ikke hente kommentarer");
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, [taskId]);

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    try {
      setIsSubmitting(true);
      const newComment = await createComment(taskId, { message: comment.trim() });
      setComments((prev) => [...prev, newComment]);
      if (currentUser && !commentAuthors[newComment.user_id]) {
        try {
          const userData = await getUser(newComment.user_id);
          setCommentAuthors((prev) => ({ ...prev, [newComment.user_id]: userData }));
        } catch {}
      }
      setComment("");
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
    <View>
      <Text className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
        Kommentarer ({comments.length})
      </Text>

      {isLoading ? (
        <ActivityIndicator color="#0f6e56" />
      ) : error ? (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      ) : comments.length === 0 ? (
        <Text className="text-sm text-[#9DA1B4] italic py-2 mb-4">Ingen kommentarer endnu</Text>
      ) : (
        <View className="gap-4 mb-4">
          {comments.map((c) => {
            const isOwn = currentUser?.user_id === c.user_id;
            return isOwn ? (
              <OwnUserTaskCommentBubble key={c.comment_id} comment={c} onDelete={handleDelete} />
            ) : (
              <UserTaskCommentBubble key={c.comment_id} comment={c} author={commentAuthors[c.user_id]} />
            );
          })}
        </View>
      )}

      {/* Input */}
      <View className="mt-2">
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Tilføj en kommentar..."
          placeholderTextColor="#9DA1B4"
          multiline
          editable={!isSubmitting}
          className="bg-white border border-[#E8E6E1] rounded-lg px-4 py-3 text-sm text-[#1B1D22] min-h-[80px]"
          textAlignVertical="top"
        />
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!comment.trim() || isSubmitting}
          className="self-end mt-3 px-5 py-2.5 rounded-lg bg-[#0f6e56] disabled:opacity-50"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-semibold text-sm">Kommenter</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
