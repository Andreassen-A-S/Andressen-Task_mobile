import { View, Text, ActivityIndicator } from "react-native";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import UserTaskCommentBubble from "./UserTaskCommentBubble";
import OwnUserTaskCommentBubble from "./OwnUserTaskCommentBubble";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";

interface Props {
  comments: TaskComment[];
  commentAuthors: Record<string, User>;
  isLoading: boolean;
  error: string | null;
  currentUserId?: string;
  onDelete: (commentId: string) => void;
}

export default function UserTaskComment({
  comments,
  commentAuthors,
  isLoading,
  error,
  currentUserId,
  onDelete,
}: Props) {
  return (
    <View>
      <Text className="mb-4" style={typography.overline}>
        Kommentarer ({comments.length})
      </Text>

      {isLoading ? (
        <ActivityIndicator color={colors.green} />
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
    </View>
  );
}
