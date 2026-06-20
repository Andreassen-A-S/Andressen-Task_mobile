import { View } from "react-native";
import { CommentReplyTarget } from "@/types/comment";
import CommentReplyPreview from "./CommentReplyPreview";

interface Props {
  reply: CommentReplyTarget;
  onCancel: () => void;
}

export default function CommentReplyBanner({ reply, onCancel }: Props) {
  return (
    <View
      className="rounded-2xl border border-surface-subtle bg-white px-3 py-2"
      style={{
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      }}
    >
      <CommentReplyPreview
        authorName={reply.authorName}
        isOwn={reply.isOwn}
        preview={reply.preview}
        attachmentUrl={reply.attachmentUrl}
        attachmentWidth={reply.attachmentWidth}
        attachmentHeight={reply.attachmentHeight}
        variant="composer"
        onCancel={onCancel}
      />
    </View>
  );
}
