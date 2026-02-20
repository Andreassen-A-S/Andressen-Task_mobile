import { View, Text } from "react-native";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import { formatCommentDate } from "@/helpers/helpers";
import SingleAvatar from "../../common/label/singleAvatar";
import { typography } from "@/constants/typography";

interface Props {
  comment: TaskComment;
  author?: User;
}

export default function UserTaskCommentBubble({ comment, author }: Props) {
  return (
    <View className="gap-1">
      <View className="flex-row items-center gap-2">
        <SingleAvatar
          name={author?.name || "?"}
          size="xs"
        />

        <Text style={typography.labelLg}>
          {author?.name || author?.email || "Ukendt bruger"}
        </Text>
        <Text style={typography.monoXs}>{formatCommentDate(comment.created_at)}</Text>
      </View>

      {/* Comment bubble */}
      <View className="min-w-0 max-w-[75%] self-start">
        <View className="min-w-0 rounded-lg px-3 py-2 bg-[#F6F5F1]">
          <Text style={typography.bodySm}>{comment.message}</Text>
        </View>
      </View>
    </View>
  );
}
