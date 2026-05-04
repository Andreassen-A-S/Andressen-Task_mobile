import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import { typography } from "@/constants/typography";
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
    const options: { text: string; style?: "default" | "cancel" | "destructive"; onPress?: () => void }[] = [
      { text: "Annuller", style: "cancel" },
    ];
    if (isOwn && onDelete) {
      options.push({ text: "Slet", style: "destructive", onPress: () => onDelete(deleteId ?? comment.comment_id) });
    }
    Alert.alert(comment.message ? "" : "Vedhæftning", comment.message ?? "Handlinger", options);
  };

  const align = isOwn ? "flex-end" : "flex-start";

  return (
    <View style={{ alignSelf: align, gap: 4 }}>
      {!isOwn && (
        <View className="flex-row items-center gap-2">
          <SingleAvatar name={author?.name || "?"} size="xs" />
          <Text style={typography.labelLg}>{author?.name || author?.email || "Ukendt bruger"}</Text>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={comment.attachments?.length ? 0.8 : 1}
        onLongPress={isOwn && status === "idle" && !comment.message ? handleLongPress : undefined}
        delayLongPress={400}
      >
        <CommentAttachments attachments={comment.attachments ?? []} align={align} />
      </TouchableOpacity>

      {comment.message ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onLongPress={status === "idle" ? handleLongPress : undefined}
          delayLongPress={400}
          className="max-w-[75%] rounded-lg px-3 py-2"
          style={{ alignSelf: align, backgroundColor: isOwn ? colors.green : colors.white }}
        >
          <LinkedText
            text={comment.message}
            style={isOwn ? typography.bodySmWhite : typography.bodySm}
            linkStyle={{ textDecorationLine: "underline", opacity: 0.8 }}
          />
        </TouchableOpacity>
      ) : null}

      {isOwn && (
        <View style={{ minHeight: 16, justifyContent: "center", alignItems: "flex-end" }}>
          {status === "sending" && (
            <Text style={[typography.bodyXs, { color: colors.textMuted }]}>Sender</Text>
          )}
          {status === "afsendt" && (
            <Animated.Text style={[typography.bodyXs, { color: colors.textMuted, opacity }]}>Afsendt</Animated.Text>
          )}
          {status === "failed" && (
            <TouchableOpacity onPress={() => onRetry?.(comment.comment_id)} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={[typography.bodyXs, { color: colors.red }]}>{errorMessage ?? "Kunne ikke sende"}</Text>
              <Ionicons name="refresh-outline" size={12} color={colors.red} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
