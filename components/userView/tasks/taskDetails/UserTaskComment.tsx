import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import UserTaskCommentBubble from "./UserTaskCommentBubble";
import OwnUserTaskCommentBubble from "./OwnUserTaskCommentBubble";
import { typography } from "@/constants/typography";

interface Props {
  comments: TaskComment[];
  commentAuthors: Record<string, User>;
  isLoading: boolean;
  error: string | null;
  currentUserId?: string;
  onDelete: (commentId: string) => void;
  commentInput: string;
  onCommentChange: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  onInputFocus?: () => void;
}

export default function UserTaskComment({
  comments,
  commentAuthors,
  isLoading,
  error,
  currentUserId,
  onDelete,
  commentInput,
  onCommentChange,
  onSubmit,
  isSubmitting,
  onInputFocus,
}: Props) {
  return (
    <View>
      <Text className="mb-4" style={typography.overline}>
        Kommentarer ({comments.length})
      </Text>

      {isLoading ? (
        <ActivityIndicator color="#0f6e56" />
      ) : error ? (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      ) : comments.length === 0 ? (
        <Text className="py-2 mb-4" style={typography.caption}>Ingen kommentarer endnu</Text>
      ) : (
        <View className="gap-4 mb-4">
          {comments.map((c) => {
            const isOwn = currentUserId === c.user_id;
            return isOwn ? (
              <OwnUserTaskCommentBubble key={c.comment_id} comment={c} onDelete={onDelete} />
            ) : (
              <UserTaskCommentBubble key={c.comment_id} comment={c} author={commentAuthors[c.user_id]} />
            );
          })}
        </View>
      )}

      {/* Composer */}
      <TextInput
        value={commentInput}
        onChangeText={onCommentChange}
        placeholder="Tilføj en kommentar..."
        placeholderTextColor="#9DA1B4"
        multiline
        editable={!isSubmitting}
        style={[typography.bodyMd, { maxHeight: 96 }]}
        className="bg-white border border-[#E8E6E1] rounded-lg px-4 h-24 focus:border-[#2D9F6F]"
        onFocus={onInputFocus}
      />
      <TouchableOpacity
        onPress={onSubmit}
        disabled={!commentInput.trim() || isSubmitting}
        className="self-end mt-2 px-5 py-2.5 rounded-lg bg-[#0f6e56] disabled:opacity-50"
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text className="text-white font-semibold text-sm">Kommenter</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
