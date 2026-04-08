import { View, Text } from "react-native";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import SingleAvatar from "../../common/label/singleAvatar";
import { typography } from "@/constants/typography";
import CommentImageGrid from "./CommentImageGrid";

interface Props {
  comment: TaskComment;
  author?: User;
}

export default function UserTaskCommentBubble({ comment, author }: Props) {
  const images = comment.attachments?.filter((a) => a.type === "IMAGE") ?? [];

  return (
    <View className="gap-1">
      <View className="flex-row items-center gap-2">
        <SingleAvatar name={author?.name || "?"} size="xs" />
        <Text style={typography.labelLg}>
          {author?.name || author?.email || "Ukendt bruger"}
        </Text>
      </View>

      <View className="self-start" style={{ gap: 4 }}>
        <CommentImageGrid images={images} />

        {comment.message ? (
          <View className="max-w-[75%] self-start rounded-lg px-3 py-2 bg-white">
            <Text style={typography.bodySm}>{comment.message}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
