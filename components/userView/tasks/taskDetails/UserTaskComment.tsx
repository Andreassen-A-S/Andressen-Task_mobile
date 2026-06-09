import { View, Text, ActivityIndicator } from "react-native";
import { formatNumber } from "@/helpers/helpers";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import CommentBubble from "./CommentBubble";
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
      <Text className="overline mb-4">
        Kommentarer ({formatNumber(comments.length)})
      </Text>

      {isLoading ? (
        <ActivityIndicator color={colors.green} />
      ) : error ? (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      ) : comments.length === 0 ? (
        <Text className="caption py-2 mb-4">Ingen kommentarer endnu</Text>
      ) : (
        <View className="gap-4 mb-4">
          {comments.map((c) => {
            const isOwn = currentUserId === c.user_id;
            return (
              <CommentBubble key={c.comment_id} comment={c} isOwn={isOwn} author={commentAuthors[c.user_id]} onDelete={onDelete} />
            );
          })}
        </View>
      )}
    </View>
  );
}
