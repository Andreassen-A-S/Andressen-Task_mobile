import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated, ActionSheetIOS } from "react-native";
import { RotateCw } from "lucide-react-native";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import { colors } from "@/constants/colors";
import SingleAvatar from "../../common/label/singleAvatar";
import CommentAttachments from "./CommentAttachments";
import LinkedText from "../../common/LinkedText";

type StatusState = "sending" | "afsendt" | "failed" | "idle";

interface Props {
  comment: TaskComment;
  isOwn: boolean;
  author?: User;
  sending?: boolean;
  failed?: boolean;
  errorMessage?: string;
  deleteId?: string;
  onDelete?: (commentId: string) => void;
  onRetry?: (commentId: string) => void;
}

export default function CommentBubble({ comment, isOwn, author, sending, failed, errorMessage, deleteId, onDelete, onRetry }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [status, setStatus] = useState<StatusState>(sending ? "sending" : failed ? "failed" : "idle");

  useEffect(() => {
    if (!isOwn) return;
    if (sending) {
      setStatus("sending");
    } else if (failed) {
      setStatus("failed");
    } else if (status === "sending") {
      setStatus("afsendt");
      opacity.setValue(1);
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(() => setStatus("idle"));
    }
  }, [sending, failed, isOwn]);

  const handleLongPress = () => {
    if (!isOwn || !onDelete || status !== "idle") return;
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Annuller", "Slet besked"],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 0,
      },
      (index) => {
        if (index === 1) onDelete(deleteId ?? comment.comment_id);
      },
    );
  };

  const align = isOwn ? "flex-end" : "flex-start";

  return (
    <View className={`gap-1 ${isOwn ? "self-end" : "self-start"}`}>
      {!isOwn && (
        <View className="flex-row items-center gap-2">
          <SingleAvatar name={author?.name || "?"} imageUrl={author?.profile_picture_url} size="xs" />
          <Text className="label-md">{author?.name || author?.email || "Ukendt bruger"}</Text>
        </View>
      )}

      <CommentAttachments
        attachments={comment.attachments ?? []}
        align={align}
        onLongPress={isOwn && status === "idle" && !comment.message ? handleLongPress : undefined}
      />

      {comment.message ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onLongPress={isOwn && status === "idle" ? handleLongPress : undefined}
          delayLongPress={400}
          className={`max-w-[75%] rounded-lg px-3 py-2 ${isOwn ? "self-end bg-accent" : "self-start bg-surface"}`}
        >
          <LinkedText
            text={comment.message}
            className={isOwn ? "body-sm-white" : "body-sm"}
            linkStyle={{ textDecorationLine: "underline", opacity: 0.8 }}
          />
        </TouchableOpacity>
      ) : null}

      {isOwn && (
        <View className="min-h-4 justify-center items-end">
          {status === "sending" && (
            <Text className="body-xs text-muted">Sender</Text>
          )}
          {status === "afsendt" && (
            <Animated.Text className="body-xs text-muted" style={{ opacity }}>Afsendt</Animated.Text>
          )}
          {status === "failed" && (
            <TouchableOpacity onPress={() => onRetry?.(comment.comment_id)} className="flex-row items-center gap-1">
              <Text className="body-xs text-danger">{errorMessage ?? "Kunne ikke sende"}</Text>
              <RotateCw size={12} color={colors.red} strokeWidth={2.2} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
