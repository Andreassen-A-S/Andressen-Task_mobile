import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { captureRef } from "react-native-view-shot";
import { Asset as MediaAsset, requestPermissionsAsync as requestMediaPermissionsAsync } from "expo-media-library";
import { File as FSFile, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { RotateCw } from "lucide-react-native";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import { colors } from "@/constants/colors";
import SingleAvatar from "../../common/label/singleAvatar";
import CommentAttachments from "./CommentAttachments";
import LinkedText from "../../common/LinkedText";
import { showToast } from "@/lib/toast";
import { type BubbleLayout, type MenuParams } from "./CommentContextMenu";

type StatusState = "sender" | "leveret" | "fejl" | "idle";

interface Props {
  comment: TaskComment;
  isOwn: boolean;
  deleted?: boolean;
  deletedAuthor?: { name?: string | null; email?: string | null; profile_picture_url?: string | null };
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  author?: User;
  sending?: boolean;
  failed?: boolean;
  errorMessage?: string;
  deleteId?: string;
  hidden?: boolean;
  onDelete?: (commentId: string) => void;
  onRetry?: (commentId: string) => void;
  onMenuOpen?: (params: MenuParams) => void;
}

export default function CommentBubble({ comment, isOwn, deleted, deletedAuthor, isFirstInGroup = true, isLastInGroup = true, author, sending, failed, errorMessage, deleteId, hidden, onDelete, onRetry, onMenuOpen }: Props) {
  const pulseOpacity = useRef(new Animated.Value(1)).current;
  const leveretOpacity = useRef(new Animated.Value(0)).current;
  const [status, setStatus] = useState<StatusState>(sending ? "sender" : failed ? "fejl" : "idle");
  const bubbleRef = useRef<View>(null);
  const textBubbleRef = useRef<any>(null);
  const attachmentsRef = useRef<View>(null);
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (status !== "sender") return;
    pulseOpacity.setValue(1);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    pulseLoopRef.current = loop;
    loop.start();
    return () => loop.stop();
  }, [status]);

  useEffect(() => {
    if (!isOwn || status !== "leveret" || isLastInGroup) return;
    Animated.timing(leveretOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      setStatus("idle");
    });
  }, [isLastInGroup]);

  useEffect(() => {
    if (!isOwn) return;
    if (sending) {
      setStatus("sender");
    } else if (failed) {
      setStatus("fejl");
    } else if (status === "sender") {
      pulseLoopRef.current?.stop();
      Animated.timing(pulseOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        leveretOpacity.setValue(0);
        setStatus("leveret");
        Animated.timing(leveretOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      });
    }
  }, [sending, failed, isOwn]);

  const handleCopy = () => {
    if (!comment.message) return;
    try {
      // expo-clipboard: run `npx expo install expo-clipboard` + pod install to enable
      const Clipboard = require("expo-clipboard");
      Clipboard.setStringAsync(comment.message).then(() => {
        showToast({ title: "Kopieret", message: "" });
      });
    } catch {
      showToast({ title: "Kopiering ikke tilgængelig", message: "" });
    }
  };

  const isRemoteUri = (uri: string) =>
    !uri.startsWith("file://") && !uri.startsWith("ph://") && !uri.startsWith("content://");

  const handleSave = async () => {
    const attachments = comment.attachments ?? [];
    const images = attachments.filter((a) => a.type === "IMAGE" && isRemoteUri(a.url));
    const files = attachments.filter((a) => a.type === "FILE" && isRemoteUri(a.url));

    try {
      if (images.length > 0) {
        const { status } = await requestMediaPermissionsAsync();
        if (status !== "granted") {
          showToast({ title: "Tilladelse krævet", message: "Giv adgang til fotobiblioteket for at gemme billeder." });
          return;
        }
        for (const img of images) {
          const ext = img.file_name?.split(".").pop() ?? "jpg";
          const dest = new FSFile(Paths.cache, `save_${img.attachment_id}.${ext}`);
          const downloaded = await FSFile.downloadFileAsync(img.url, dest, { idempotent: true });
          await MediaAsset.create(downloaded.uri);
        }
        showToast({ title: "Gemt", message: images.length === 1 ? "Billede gemt til biblioteket." : `${images.length} billeder gemt til biblioteket.` });
      }

      for (const file of files) {
        const ext = file.file_name?.split(".").pop() ?? "bin";
        const dest = new FSFile(Paths.cache, `share_${file.attachment_id}.${ext}`);
        const downloaded = await FSFile.downloadFileAsync(file.url, dest, { idempotent: true });
        await Sharing.shareAsync(downloaded.uri, { dialogTitle: file.file_name ?? "Fil" });
      }
    } catch (err) {
      console.error("handleSave error:", err);
      showToast({ title: "Fejl", message: "Kunne ikke gemme." });
    }
  };

  const measureRef = (ref: React.RefObject<any>): Promise<BubbleLayout> =>
    new Promise((resolve) => {
      ref.current.measure((_: number, __: number, w: number, h: number, px: number, py: number) => {
        resolve({ pageX: px, pageY: py, width: w, height: h });
      });
    });

  const handleLongPress = async () => {
    const canDelete = isOwn && !!onDelete && (status === "idle" || status === "leveret");
    const canCopy = !!comment.message;
    const canSave = (comment.attachments ?? []).some((a) => isRemoteUri(a.url));
    if (!canDelete && !canCopy && !canSave) return;
    if (!bubbleRef.current) return;

    const hasAttachments = (comment.attachments?.length ?? 0) > 0;

    const outerLayout = await measureRef(bubbleRef);
    const snapshotLayout = comment.message && textBubbleRef.current
      ? await measureRef(textBubbleRef)
      : undefined;

    let attachmentsSnapshot: string | undefined;
    let attachmentsLayout: BubbleLayout | undefined;
    if (hasAttachments && attachmentsRef.current) {
      [attachmentsLayout, attachmentsSnapshot] = await Promise.all([
        measureRef(attachmentsRef),
        captureRef(attachmentsRef, { format: "png" }),
      ]);
    }

    onMenuOpen?.({
      layout: outerLayout,
      snapshotLayout,
      attachmentsLayout,
      attachmentsSnapshot,
      message: comment.message || undefined,
      isOwn,
      canDelete,
      canCopy,
      canSave,
      onDelete: () => onDelete?.(deleteId ?? comment.comment_id),
      onCopy: handleCopy,
      onSave: handleSave,
    });
  };

  if (deleted) {
    const authorName = (deletedAuthor?.name ?? deletedAuthor?.email ?? author?.name ?? author?.email) || "Ukendt bruger";

    if (isOwn) {
      return (
        <View className="self-end" style={hidden ? { opacity: 0 } : undefined}>
          <View
            style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 }}
          >
            <Text className="body-md !text-muted" style={{ fontStyle: "italic" }}>Kommentar slettet</Text>
          </View>
        </View>
      );
    }

    return (
      <View className="flex-row items-end gap-2" style={hidden ? { opacity: 0 } : undefined}>
        <SingleAvatar
          name={authorName}
          imageUrl={deletedAuthor?.profile_picture_url ?? author?.profile_picture_url}
          size="xs"
        />
        <View className="items-start gap-1">
          <Text className="label-sm text-muted">{authorName}</Text>
          <View
            style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 }}
          >
            <Text className="body-md text-muted" style={{ fontStyle: "italic" }}>(Kommentar slettet)</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!isOwn) {
    return (
      <View className="flex-row items-end gap-2" style={hidden ? { opacity: 0 } : undefined}>
        {isLastInGroup
          ? <SingleAvatar name={author?.name || "?"} imageUrl={author?.profile_picture_url} size="xs" />
          : <View style={{ width: 24 }} />
        }
        <View ref={bubbleRef} collapsable={false} style={{ flex: 1, gap: 4 }}>
          {isFirstInGroup && (
            <Text className="label-sm text-muted">{author?.name || author?.email || "Ukendt bruger"}</Text>
          )}
          <View ref={attachmentsRef} collapsable={false}>
            <CommentAttachments
              attachments={comment.attachments ?? []}
              align="flex-start"
              onLongPress={handleLongPress}
            />
          </View>
          {comment.message ? (
            <TouchableOpacity
              ref={textBubbleRef}
              activeOpacity={0.8}
              onLongPress={handleLongPress}
              delayLongPress={350}
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
    <View ref={bubbleRef} collapsable={false} className="gap-1 self-end" style={hidden ? { opacity: 0 } : undefined}>
      <View ref={attachmentsRef} collapsable={false}>
        <CommentAttachments
          attachments={comment.attachments ?? []}
          align="flex-end"
          onLongPress={status === "idle" || status === "leveret" ? handleLongPress : undefined}
        />
      </View>
      {comment.message ? (
        <TouchableOpacity
          ref={textBubbleRef}
          activeOpacity={0.8}
          onLongPress={status === "idle" || status === "leveret" ? handleLongPress : undefined}
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

      {status !== "idle" && (
        <View className="min-h-4 justify-center items-end">
          {status === "sender" && (
            <Animated.Text className="body-xs text-muted" style={{ opacity: pulseOpacity }}>Sender</Animated.Text>
          )}
          {status === "leveret" && (
            <Animated.Text className="body-xs text-muted" style={{ opacity: leveretOpacity }}>Leveret</Animated.Text>
          )}
          {status === "fejl" && (
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
