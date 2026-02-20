import { View, Text } from "react-native";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import { formatCommentDate } from "@/helpers/helpers";
import SingleAvatar from "../../common/label/singleAvatar";

interface Props {
  comment: TaskComment;
  author?: User;
}

export default function UserTaskCommentBubble({ comment, author }: Props) {
  return (
    <View className="gap-1">
      <View className="flex-row items-center gap-2">
        <SingleAvatar name={author?.name || "?"} size="xs" />
        <Text className="text-sm font-semibold text-[#1B1D22]">
          {author?.name || author?.email || "Ukendt bruger"}
        </Text>
        <Text className="text-xs text-[#9DA1B4]">{formatCommentDate(comment.created_at)}</Text>
      </View>
      <View className="max-w-[75%]">
        <View className="rounded-lg px-3 py-2 bg-[#F6F5F1]">
          <Text className="text-sm text-[#1B1D22] leading-relaxed">{comment.message}</Text>
        </View>
      </View>
    </View>
  );
}
