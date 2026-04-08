import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TaskComment } from "@/types/comment";
import { formatCommentDate } from "@/helpers/helpers";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import CommentImageGrid from "./CommentImageGrid";

interface Props {
  comment: TaskComment;
  onDelete: (commentId: string) => void;
}

export default function OwnUserTaskCommentBubble({ comment, onDelete }: Props) {
  const confirmDelete = () => {
    Alert.alert("Slet kommentar", "Er du sikker på at du vil slette denne kommentar?", [
      { text: "Annuller", style: "cancel" },
      { text: "Slet", style: "destructive", onPress: () => onDelete(comment.comment_id) },
    ]);
  };

  const images = comment.attachments?.filter((a) => a.type === "IMAGE") ?? [];
  return (
    <View className="self-end" style={{ gap: 4 }}>
      <Text className="text-right mb-1" style={typography.monoXs}>
        {formatCommentDate(comment.created_at)}
      </Text>

      <CommentImageGrid images={images} align="flex-end" />

      {comment.message ? (
        <View className="max-w-[75%] self-end rounded-lg px-3 py-2" style={{ backgroundColor: colors.green }}>
          <Text style={typography.bodySmWhite}>{comment.message}</Text>
        </View>
      ) : null}

      <TouchableOpacity onPress={confirmDelete} className="flex-row items-center gap-1 mt-1 self-end">
        <Ionicons name="trash-outline" size={12} color={colors.textMuted} />
        <Text className="text-xs" style={{ color: colors.textMuted }}>Slet</Text>
      </TouchableOpacity>
    </View>
  );
}
