import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { RotateCw } from "lucide-react-native";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import { colors } from "@/constants/colors";
import SingleAvatar from "../../common/label/singleAvatar";
import CommentAttachments from "./CommentAttachments";
import LinkedText from "../../common/LinkedText";
import { type BubbleLayout, type MenuParams } from "./CommentContextMenu";

type StatusState = "sending" | "afsendt" | "failed" | "idle";

interface Props {
  comment: TaskComment;
  isOwn: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  author?: User;
  sending?: boolean;
  failed?: boolean;
  errorMessage?: string;
  deleteId?: string;
  onDelete?: (commentId: string) => void;
  onRetry?: (commentId: string) => void;
  onMenuOpen?: (params: MenuParams) => void;
}

export default function CommentBubble({ comment, isOwn, isFirstInGroup = true, isLastInGroup = true, author, sending, failed, errorMessage, deleteId, onDelete, onRetry, onMenuOpen }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [status, setStatus] = useState<StatusState>(sending ? "sending" : failed ? "failed" : "idle");
  const bubbleRef = useRef<View>(null);

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
    bubbleRef.current?.measure((_, __, width, height, pageX, pageY) => {
      onMenuOpen?.({
        layout: { pageX, pageY, width, height },
        message: comment.message || undefined,
        isOwn,
        canDelete: isOwn && !!onDelete && status === "idle",
        onDelete: () => onDelete?.(deleteId ?? comment.comment_id),
      });
    });
  };

  if (!isOwn) {
    return (
      <View className="flex-row items-end gap-2">
        {isLastInGroup
          ? <SingleAvatar name={author?.name || "?"} imageUrl={author?.profile_picture_url} size="xs" />
          : <View style={{ width: 24 }} />
        }
        <View style={{ flex: 1, gap: 4 }}>
          {isFirstInGroup && (
            <Text className="label-sm text-muted">{author?.name || author?.email || "Ukendt bruger"}</Text>
          )}
          <CommentAttachments
            attachments={comment.attachments ?? []}
            align="flex-start"
          />
          {comment.message ? (
            <TouchableOpacity
              activeOpacity={0.8}
              className="max-w-[85%] rounded-2xl px-3 py-2 self-start bg-surface"
            >
              <LinkedText
                text={comment.message}
                className="body-md !text-secondary"
                linkStyle={{ textDecorationLine: "underline", opacity: 0.8 }}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View ref={bubbleRef} className="gap-1 self-end">
      <CommentAttachments
        attachments={comment.attachments ?? []}
        align="flex-end"
        onLongPress={status === "idle" && !comment.message ? handleLongPress : undefined}
      />
      {comment.message ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onLongPress={status === "idle" ? handleLongPress : undefined}
          delayLongPress={350}
          className="max-w-[85%] rounded-2xl px-3 py-2 self-end bg-accent"
        >
          <LinkedText
            text={comment.message}
            className="body-md !text-white"
            linkStyle={{ textDecorationLine: "underline", opacity: 0.8 }}
          />
        </TouchableOpacity>
      ) : null}

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
    </View>
  );
}
