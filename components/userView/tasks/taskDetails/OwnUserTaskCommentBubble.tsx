import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TaskComment } from "@/types/comment";
import { formatCommentDate } from "@/helpers/helpers";

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

  return (
    <View className="items-end">
      <View className="max-w-[75%]">
        <Text className="text-xs text-[#9DA1B4] text-right mb-1">
          {formatCommentDate(comment.created_at)}
        </Text>
        <View className="rounded-lg px-3 py-2 bg-[#0f6e56]">
          <Text className="text-sm text-white leading-relaxed">{comment.message}</Text>
        </View>
        <TouchableOpacity onPress={confirmDelete} className="flex-row items-center gap-1 mt-1 self-end">
          <Ionicons name="trash-outline" size={12} color="#9DA1B4" />
          <Text className="text-xs text-[#9DA1B4]">Slet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
