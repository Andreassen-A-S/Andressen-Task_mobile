import { useState, useCallback, useRef, useMemo, useEffect, type ReactNode } from "react";
import { ArrowDown, Lock } from "lucide-react-native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  type TextInputSelectionChangeEventData,
} from "react-native";
import Reanimated, { useAnimatedStyle } from "react-native-reanimated";
import { KeyboardAvoidingView, useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { attachmentPickerStore } from "@/lib/attachmentPickerStore";
import { showToast } from "@/lib/toast";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useAuth } from "@/hooks/useAuth";
import { getTaskEvents, createComment, deleteComment, getUser, getTask, prepareAttachments, uploadToGcs, type TaskEvent } from "@/lib/api";
import { File as FSFile } from "expo-file-system";
import { formatGroupTimestamp } from "@/helpers/helpers";
import { MAX_FILE_SIZE } from "@/helpers/attachmentHelpers";
import { CommentReplyTarget, TaskComment } from "@/types/comment";
import { TaskStatus } from "@/types/task";
import { User } from "@/types/users";
import { colors } from "@/constants/colors";
import PathHeader, { usePathHeaderHeight } from "@/components/userView/common/PathHeader";
import AvatarCluster from "@/components/userView/common/label/AvatarCluster";
import { PendingAttachmentPreview } from "@/components/userView/common/PendingAttachmentStrip";
import CommentBubble from "./CommentBubble";
import CommentComposer, { INPUT_BAR_OVERLAP, ATTACHMENT_LIST_EXTRA_HEIGHT, REPLY_PREVIEW_EXTRA_HEIGHT } from "./CommentComposer";
import MentionSuggestions from "./MentionSuggestions";
import CommentContextMenu, { type MenuParams } from "./CommentContextMenu";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";

export type PendingAttachment = PendingAttachmentPreview;

type DisplayComment = TaskComment & {
  sending?: boolean;
  failed?: boolean;
  errorMessage?: string;
  serverCommentId?: string;
  deleted?: boolean;
  deletedAuthor?: { name?: string | null; email?: string | null; profile_picture_url?: string | null };
};

const TIMESTAMP_THRESHOLD_MS = 30 * 60 * 1000;

type ListItem =
  | { type: "comment"; data: DisplayComment; isFirstInGroup: boolean; isLastInGroup: boolean }
  | { type: "timestamp"; key: string; label: string };

function CommentRow({
  children,
  marginBottom,
  highlightPulse,
  onLayout,
}: {
  children: ReactNode;
  marginBottom: number;
  highlightPulse: number;
  onLayout: (event: LayoutChangeEvent) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (highlightPulse === 0) return;
    scale.stopAnimation();
    scale.setValue(1);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.045, duration: 110, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  }, [highlightPulse, scale]);

  return (
    <Animated.View
      onLayout={onLayout}
      style={{ marginBottom, transform: [{ scale }] }}
    >
      {children}
    </Animated.View>
  );
}

export default function TaskComments() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const insets = useSafeAreaInsets();
  const [isArchived, setIsArchived] = useState(false);
  const router = useRouter();
  const headerHeight = usePathHeaderHeight();
  const { user: currentUser } = useAuth();
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const isNearBottomRef = useRef(true);
  const hasLoadedRef = useRef(false);
  const scrollPendingRef = useRef(false);
  const scrollOpacity = useRef(new Animated.Value(0)).current;
  const commentLayoutsRef = useRef(new Map<string, number>());
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [comments, setComments] = useState<DisplayComment[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, User>>({});
  const [assignees, setAssignees] = useState<User[]>([]);
  const [taskTitle, setTaskTitle] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [replyingTo, setReplyingTo] = useState<CommentReplyTarget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [highlightRequest, setHighlightRequest] = useState({ commentId: "", pulse: 0 });
  const scrollDownAnim = useRef(new Animated.Value(0)).current;
  const pendingAttachmentIdRef = useRef(0);
  const cursorPosRef = useRef(0);
  const inputValueRef = useRef("");

  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [pendingMentions, setPendingMentions] = useState<{ name: string; userId: string }[]>([]);
  const [inputSelection, setInputSelection] = useState<{ start: number; end: number } | undefined>(undefined);

  const { progress, height: keyboardHeight } = useReanimatedKeyboardAnimation();

  const mentionCandidates = useMemo(() => {
    const map = new Map<string, User>();
    for (const u of [...assignees, ...Object.values(commentAuthors)]) {
      if (u.user_id !== currentUser?.user_id) map.set(u.user_id, u);
    }
    return [...map.values()];
  }, [assignees, commentAuthors, currentUser]);

  const mentionNames = useMemo(() => {
    const names = new Set<string>();
    for (const u of [...assignees, ...Object.values(commentAuthors), ...(currentUser ? [currentUser] : [])]) {
      const name = u.name || u.email;
      if (name) names.add(name);
    }
    return [...names];
  }, [assignees, commentAuthors, currentUser]);

  const visibleMentionCandidates = useMemo(() => {
    if (mentionQuery === null) return [];
    if (mentionQuery === "") return mentionCandidates;
    const q = mentionQuery.toLowerCase();
    return mentionCandidates.filter((u) =>
      (u.name || u.email || "").toLowerCase().startsWith(q)
    );
  }, [mentionQuery, mentionCandidates]);

  const composerHeight =
    INPUT_BAR_OVERLAP +
    (pendingAttachments.length > 0 ? ATTACHMENT_LIST_EXTRA_HEIGHT : 0) +
    (replyingTo ? REPLY_PREVIEW_EXTRA_HEIGHT : 0);
  const arrowBottomStyle = useAnimatedStyle(() => ({ bottom: composerHeight - progress.value * insets.bottom + 8 }));
  const scrollSpacerStyle = useAnimatedStyle(() => ({ height: isArchived ? 16 : composerHeight - progress.value * insets.bottom }));
  const mentionOverlayStyle = useAnimatedStyle(() => ({
    bottom: -keyboardHeight.value + composerHeight - progress.value * insets.bottom + 8,
  }));

  const listData = useMemo<ListItem[]>(() => {
    const result: ListItem[] = [];
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      const prev = comments[i - 1];
      const next = comments[i + 1];
      const prevGap = !prev || new Date(comment.created_at).getTime() - new Date(prev.created_at).getTime() > TIMESTAMP_THRESHOLD_MS;
      const nextGap = !next || new Date(next.created_at).getTime() - new Date(comment.created_at).getTime() > TIMESTAMP_THRESHOLD_MS;
      if (prevGap) result.push({ type: "timestamp", key: `ts-${comment.comment_id}`, label: formatGroupTimestamp(comment.created_at) });
      result.push({
        type: "comment",
        data: comment,
        isFirstInGroup: prevGap || !prev || prev.user_id !== comment.user_id,
        isLastInGroup: nextGap || !next || next.user_id !== comment.user_id,
      });
    }
    return result;
  }, [comments]);

  const uploadAttachments = async (attachments: {
    uri: string;
    fileName: string;
    mimeType: string;
    fileSize?: number;
    width?: number;
    height?: number;
  }[]): Promise<string[]> => {
    const processed = await Promise.all(
      attachments.map(async ({ uri, fileName, mimeType, fileSize, width, height }) => {
        const isHeicLike = mimeType === "image/heic" || mimeType === "image/heif" || /\.(heic|heif)$/i.test(fileName);
        let effectiveUri = uri;
        let effectiveMime = mimeType;
        let effectiveName = fileName;
        let effectiveWidth = width;
        let effectiveHeight = height;
        if (isHeicLike) {
          const converted = await ImageManipulator.manipulateAsync(uri, [], { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG });
          effectiveUri = converted.uri;
          effectiveMime = "image/jpeg";
          effectiveName = fileName.replace(/\.[^.]+$/, ".jpg").replace(/^([^.]+)$/, "$1.jpg");
          effectiveWidth = converted.width;
          effectiveHeight = converted.height;
        }
        const realSize = fileSize ?? new FSFile(effectiveUri).size;
        const maxBytes = MAX_FILE_SIZE[effectiveMime] ?? 10 * 1024 * 1024;
        if (realSize > maxBytes) throw new Error(`${effectiveName} er for stor (max ${maxBytes / (1024 * 1024)} MB)`);
        return {
          uri: effectiveUri,
          fileName: effectiveName,
          mimeType: effectiveMime,
          fileSize: realSize,
          width: effectiveWidth ? Math.round(effectiveWidth) : undefined,
          height: effectiveHeight ? Math.round(effectiveHeight) : undefined,
        };
      }),
    );
    const prepared = await prepareAttachments(
      taskId,
      processed.map(({ fileName, mimeType, fileSize, width, height }) => ({
        file_name: fileName,
        mime_type: mimeType,
        file_size: fileSize,
        ...(width && height ? { width, height } : {}),
      })),
    );
    await Promise.all(prepared.map((p, i) => uploadToGcs(p.upload_url, processed[i].uri, processed[i].mimeType)));
    return prepared.map((p) => p.upload_token);
  };

  const resolveCommentId = (event: TaskEvent): string | undefined => {
    const comment = event.comment as Record<string, unknown> | null;
    const before = event.before_json as Record<string, unknown> | null;
    const after = event.after_json as Record<string, unknown> | null;
    return (comment?.comment_id ?? event.comment_id ?? before?.comment_id ?? after?.comment_id) as string | undefined;
  };

  const fetchComments = useCallback(async (silent = false) => {
    if (!taskId) {
      setFetchError("Ugyldigt opgave-id");
      setIsLoading(false);
      return;
    }
    try {
      if (!silent) {
        setIsLoading(true);
        setFetchError(null);
      }
      const [taskData, events] = await Promise.all([getTask(taskId), getTaskEvents(taskId)]);
      const archived = taskData.status === TaskStatus.ARCHIVED;
      setIsArchived(archived);
      setTaskTitle(taskData.title);

      // Mirror FE timeline logic: render the original COMMENT_CREATED entry and
      // attach the matching COMMENT_DELETED event to it.
      const deletedEventMap = new Map<string, TaskEvent>();
      for (const e of events) {
        if (e.type === "COMMENT_DELETED") {
          const id = resolveCommentId(e);
          if (id) deletedEventMap.set(id, e);
        }
      }

      const data: DisplayComment[] = events
        .filter((e) => e.type === "COMMENT_CREATED")
        .reduce<DisplayComment[]>((acc, e) => {
          const c = e.comment as Record<string, unknown> | null;
          const a = e.after_json as Record<string, unknown> | null;
          const commentId = resolveCommentId(e);
          if (!commentId) return acc;
          const deletedEvent = deletedEventMap.get(commentId);
          acc.push({
            comment_id: commentId,
            task_id: taskId,
            user_id: (c?.user_id ?? a?.user_id ?? e.actor_id) as string,
            message: (c?.message ?? a?.message) as string | undefined,
            created_at: (c?.created_at ?? a?.created_at ?? e.created_at) as string,
            updated_at: (c?.updated_at ?? a?.updated_at ?? e.created_at) as string,
            attachments: deletedEvent ? [] : ((c?.attachments ?? []) as TaskComment['attachments']),
            reply_to_comment_id: (c != null ? c.reply_to_comment_id : (a?.reply_to_comment_id ?? null)) as string | null,
            reply_preview: (c?.reply_preview ?? a?.reply_preview ?? null) as string | null,
            reply_author_id: (c?.reply_author_id ?? a?.reply_author_id ?? null) as string | null,
            reply_author_name: (c?.reply_author_name ?? a?.reply_author_name ?? null) as string | null,
            deleted: !!deletedEvent,
            deletedAuthor: e.actor ?? undefined,
          });
          return acc;
        }, [])
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      const commentsById = new Map(data.map((comment) => [comment.comment_id, comment]));
      for (const comment of data) {
        if (!comment.reply_to_comment_id) continue;
        const original = commentsById.get(comment.reply_to_comment_id);
        if (original?.message?.trim()) continue;
        const replyImage = original?.attachments.find((attachment) => attachment.type === "IMAGE");
        comment.reply_attachment_url = replyImage?.url ?? null;
        comment.reply_attachment_width = replyImage?.width ?? null;
        comment.reply_attachment_height = replyImage?.height ?? null;
      }
      setComments([...data]);
      setFetchError(null);
      const assigneeIds = (taskData.assignment_users ?? []).map((u) => u.user_id);
      const commentIds = data.map((c) => c.user_id);
      const uniqueIds = [...new Set([...assigneeIds, ...commentIds])];
      const userMap: Record<string, User> = {};
      await Promise.all(uniqueIds.map(async (id) => {
        try { userMap[id] = await getUser(id); } catch { }
      }));
      setCommentAuthors(userMap);
      setAssignees(assigneeIds.flatMap((id) => userMap[id] ? [userMap[id]] : []));
    } catch {
      if (!silent) setFetchError("Kunne ikke hente kommentarer");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [taskId]);

  useFocusEffect(useCallback(() => {
    if (!hasLoadedRef.current) scrollOpacity.setValue(0); // hide until scroll lands on first load
    fetchComments(hasLoadedRef.current);
    hasLoadedRef.current = true;
  }, [fetchComments]));

  useEffect(() => () => {
    attachmentPickerStore.clear();
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
  }, []);

  useEffect(() => {
    Animated.spring(scrollDownAnim, {
      toValue: showScrollDown ? 1 : 0,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
  }, [showScrollDown]);

  const addPickedAssets = async (assets: ImagePicker.ImagePickerAsset[]) => {
    const ts = Date.now();
    const newAttachments: PendingAttachment[] = [];
    const oversized: string[] = [];

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      const assetFileName = asset.fileName ?? "";
      const isHeicLike = asset.mimeType === "image/heic" || asset.mimeType === "image/heif" || /\.(heic|heif)$/i.test(assetFileName);
      let localUri = asset.uri;
      let mime = asset.mimeType ?? (isHeicLike ? "image/heic" : "image/jpeg");
      let width = asset.width;
      let height = asset.height;
      let ext = isHeicLike ? "heic" : mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
      let fileName = asset.fileName ?? `photo_${ts}_${i}.${ext}`;
      const maxBytes = MAX_FILE_SIZE[mime] ?? 10 * 1024 * 1024;
      if (asset.fileSize != null && asset.fileSize > maxBytes) {
        oversized.push(fileName);
      } else {
        if (isHeicLike) {
          try {
            const converted = await ImageManipulator.manipulateAsync(asset.uri, [], { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG });
            localUri = converted.uri;
            mime = "image/jpeg";
            fileName = fileName.replace(/\.[^.]+$/, ".jpg").replace(/^([^.]+)$/, "$1.jpg");
            width = converted.width;
            height = converted.height;
          } catch { }
        }
        newAttachments.push({
          id: `pending-image-${ts}-${pendingAttachmentIdRef.current++}`,
          localUri,
          fileName,
          mimeType: mime,
          fileSize: asset.fileSize ?? undefined,
          width,
          height,
        });
      }
    }

    if (oversized.length > 0) {
      showToast({
        title: "Filer for store",
        message: `${oversized.length === 1 ? oversized[0] : `${oversized.length} filer`} overskrider den maksimale filstørrelse og blev ikke tilføjet.`,
      });
    }

    if (newAttachments.length > 0) {
      setPendingAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const pickAttachments = () => {
    attachmentPickerStore.set(async (source: "camera" | "gallery" | "files") => {
      if (source === "files") {
        const result = await DocumentPicker.getDocumentAsync({
          type: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
          multiple: true,
          copyToCacheDirectory: true,
        });
        if (!result.canceled && result.assets.length > 0) {
          const newFiles: PendingAttachment[] = [];
          const oversized: string[] = [];
          for (const asset of result.assets) {
            const name = asset.name || decodeURIComponent(asset.uri.split("/").pop() ?? "") || "Fil";
            const ext = name.split(".").pop()?.toLowerCase();
            const inferredMime = ext === "pdf" ? "application/pdf"
              : ext === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                : ext === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  : "application/octet-stream";
            const mimeType = asset.mimeType ?? inferredMime;
            const maxBytes = MAX_FILE_SIZE[mimeType] ?? 10 * 1024 * 1024;
            if (asset.size != null && asset.size > maxBytes) {
              oversized.push(name);
            } else {
              newFiles.push({
                id: `pending-file-${Date.now()}-${pendingAttachmentIdRef.current++}`,
                localUri: asset.uri,
                fileName: name,
                mimeType,
                fileSize: asset.size ?? undefined,
              });
            }
          }
          if (oversized.length > 0) {
            showToast({ title: "Filer for store", message: `${oversized.length === 1 ? oversized[0] : `${oversized.length} filer`} overskrider den maksimale filstørrelse og blev ikke tilføjet.` });
          }
          if (newFiles.length > 0) {
            setPendingAttachments((prev) => [...prev, ...newFiles]);
            return true;
          }
          return false;
        }
        return false;
      }
      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Tilladelse krævet", "Kameraadgang er nødvendig for at tage billeder.");
          return false;
        }
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 });
        if (!result.canceled) { await addPickedAssets(result.assets); return true; }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Tilladelse krævet", "Adgang til fotobiblioteket er nødvendig.");
          return false;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: true,
          selectionLimit: 20,
        });
        if (!result.canceled) { await addPickedAssets(result.assets); return true; }
      }
      return false;
    });
    router.push(`/comments/${taskId}/add-attachment`);
  };

  const startReply = (comment: DisplayComment) => {
    const commentId = comment.serverCommentId ?? comment.comment_id;
    if (!commentId || (commentId.startsWith("local-") && !comment.serverCommentId)) return;
    const author = commentAuthors[comment.user_id] ?? (comment.user_id === currentUser?.user_id ? currentUser : undefined);
    const authorName = author?.name || author?.email || "Ukendt bruger";
    const preview = comment.message?.trim()
      || ((comment.attachments?.length ?? 0) > 0 ? "Vedhæftning" : "Kommentar");
    const firstImage = !comment.message?.trim()
      ? comment.attachments?.find((attachment) => attachment.type === "IMAGE")
      : undefined;
    setReplyingTo({
      commentId,
      authorId: comment.user_id,
      authorName,
      isOwn: comment.user_id === currentUser?.user_id,
      preview: preview.slice(0, 180),
      attachmentUrl: firstImage?.url,
      attachmentWidth: firstImage?.width ?? undefined,
      attachmentHeight: firstImage?.height ?? undefined,
    });
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleSubmit = async () => {
    if (!taskId || !currentUser) return;
    if (isArchived) return;
    if (!input.trim() && pendingAttachments.length === 0) return;
    if (isSubmitting) return;
    setIsSubmitting(true);
    const replyTarget = replyingTo;

    const mentionUserIds = pendingMentions
      .filter((m) => input.includes(`@${m.name}`))
      .map((m) => m.userId);

    const localId = `local-${Date.now()}`;
    const optimistic: DisplayComment = {
      comment_id: localId,
      task_id: taskId,
      user_id: currentUser!.user_id,
      message: input.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attachments: pendingAttachments.map((a, i) => ({
        attachment_id: `${localId}-att-${i}`,
        comment_id: null,
        task_id: taskId,
        uploaded_by: currentUser!.user_id,
        type: a.mimeType.startsWith("image/") ? "IMAGE" as const : "FILE" as const,
        gcs_path: "",
        url: a.localUri,
        file_name: a.fileName,
        mime_type: a.mimeType,
        file_size: a.fileSize ?? null,
        width: a.width ?? null,
        height: a.height ?? null,
        created_at: new Date().toISOString(),
      })),
      reply_to_comment_id: replyTarget?.commentId ?? null,
      reply_preview: replyTarget?.preview ?? null,
      reply_author_id: replyTarget?.authorId ?? null,
      reply_author_name: replyTarget?.authorName ?? null,
      reply_attachment_url: replyTarget?.attachmentUrl ?? null,
      reply_attachment_width: replyTarget?.attachmentWidth ?? null,
      reply_attachment_height: replyTarget?.attachmentHeight ?? null,
      sending: true,
    };

    scrollPendingRef.current = true;
    setComments((prev) => [...prev, optimistic]);
    setInput("");
    inputValueRef.current = "";
    setPendingAttachments([]);
    setReplyingTo(null);
    setPendingMentions([]);
    setMentionQuery(null);

    try {
      const upload_tokens = pendingAttachments.length > 0
        ? await uploadAttachments(pendingAttachments.map((a) => ({
          uri: a.localUri,
          fileName: a.fileName,
          mimeType: a.mimeType,
          fileSize: a.fileSize,
          width: a.width,
          height: a.height,
        })))
        : undefined;

      const newComment = await createComment(taskId, {
        ...(optimistic.message && { message: optimistic.message }),
        upload_tokens,
        ...(replyTarget ? { reply_to_comment_id: replyTarget.commentId } : {}),
        ...(mentionUserIds.length > 0 ? { mention_user_ids: mentionUserIds } : {}),
      });

      if (!commentAuthors[newComment.user_id]) {
        try {
          const user = await getUser(newComment.user_id);
          setCommentAuthors((prev) => ({ ...prev, [newComment.user_id]: user }));
        } catch { }
      }

      setComments((prev) => prev.map((c) =>
        c.comment_id === localId
          ? {
            ...newComment,
            comment_id: localId,
            serverCommentId: newComment.comment_id,
            reply_attachment_url: c.reply_attachment_url,
            reply_attachment_width: c.reply_attachment_width,
            reply_attachment_height: c.reply_attachment_height,
            sending: false,
          }
          : c,
      ));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Kunne ikke sende besked";
      setComments((prev) => prev.map((c) =>
        c.comment_id === localId ? { ...c, sending: false, failed: true, errorMessage: msg } : c,
      ));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async (commentId: string) => {
    if (!taskId || !currentUser) return;
    const comment = comments.find((c) => c.comment_id === commentId);
    if (!comment) return;

    setComments((prev) => prev.map((c) =>
      c.comment_id === commentId ? { ...c, sending: true, failed: false, errorMessage: undefined } : c,
    ));

    try {
      const localAttachments = comment.attachments.filter((a) => a.url.startsWith("file://") || a.url.startsWith("ph://") || a.url.startsWith("content://"));
      const upload_tokens = localAttachments.length > 0
        ? await uploadAttachments(localAttachments.map((a) => ({
          uri: a.url,
          fileName: a.file_name ?? "file",
          mimeType: a.mime_type ?? "application/octet-stream",
          fileSize: a.file_size ?? undefined,
          width: a.width ?? undefined,
          height: a.height ?? undefined,
        })))
        : undefined;

      const newComment = await createComment(taskId, {
        ...(comment.message && { message: comment.message }),
        upload_tokens,
        ...(comment.reply_to_comment_id ? { reply_to_comment_id: comment.reply_to_comment_id } : {}),
      });

      setComments((prev) => prev.map((c) =>
        c.comment_id === commentId
          ? {
            ...newComment,
            comment_id: commentId,
            serverCommentId: newComment.comment_id,
            reply_attachment_url: c.reply_attachment_url,
            reply_attachment_width: c.reply_attachment_width,
            reply_attachment_height: c.reply_attachment_height,
            sending: false,
          }
          : c,
      ));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Kunne ikke sende besked";
      setComments((prev) => prev.map((c) =>
        c.comment_id === commentId ? { ...c, sending: false, failed: true, errorMessage: msg } : c,
      ));
    }
  };

  const handleDelete = async (commentId: string) => {
    const comment = comments.find((c) => c.comment_id === commentId || c.serverCommentId === commentId);
    const isLocalOnly = comment && !comment.serverCommentId && comment.comment_id.startsWith("local-");
    if (isLocalOnly) {
      setComments((prev) => prev.filter((c) => c.comment_id !== commentId));
      return;
    }
    try {
      await deleteComment(commentId);
      await fetchComments(true);
    } catch {
      Alert.alert("Fejl", "Kunne ikke slette kommentar");
    }
  };

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuParams, setMenuParams] = useState<MenuParams | null>(null);
  const [focusedCommentId, setFocusedCommentId] = useState<string | null>(null);

  const canSend = input.trim().length > 0 || pendingAttachments.length > 0;

  const handleInputChange = (text: string) => {
    inputValueRef.current = text;
    setInput(text);
    const lastAt = text.lastIndexOf("@");
    if (lastAt === -1) { setMentionQuery(null); return; }
    const afterAt = text.slice(lastAt + 1);
    if (/\s/.test(afterAt)) { setMentionQuery(null); return; }
    setMentionQuery(afterAt);
    cursorPosRef.current = text.length;
  };

  const handleSelectionChange = (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    cursorPosRef.current = e.nativeEvent.selection.end;
  };

  const handleMentionSelect = (user: User) => {
    const displayName = user.name || user.email || "";
    const cursor = cursorPosRef.current;
    const before = inputValueRef.current.slice(0, cursor);
    const lastAt = before.lastIndexOf("@");
    const after = inputValueRef.current.slice(cursor);
    const newText = inputValueRef.current.slice(0, lastAt) + `@${displayName} ` + after;
    const newCursor = lastAt + displayName.length + 2;
    inputValueRef.current = newText;
    setInput(newText);
    setMentionQuery(null);
    setPendingMentions((prev) => {
      if (prev.some((m) => m.userId === user.user_id)) return prev;
      return [...prev, { name: displayName, userId: user.user_id }];
    });
    setInputSelection({ start: newCursor, end: newCursor });
    requestAnimationFrame(() => setInputSelection(undefined));
  };

  const scrollToQuotedComment = (replyingComment: DisplayComment) => {
    const originalId = replyingComment.reply_to_comment_id;
    if (!originalId) return;

    const original = comments.find((comment) =>
      (comment.comment_id === originalId || comment.serverCommentId === originalId) && !comment.deleted
    );
    if (!original) return;

    const y = commentLayoutsRef.current.get(original.comment_id);
    if (y == null) return;

    scrollRef.current?.scrollTo({
      y: Math.max(0, y - headerHeight - 24),
      animated: true,
    });

    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightRequest((current) => ({
        commentId: original.comment_id,
        pulse: current.pulse + 1,
      }));
    }, 300);
  };

  return (
    <View className="flex-1 bg-background">
      <PathHeader
        title="Kommentarer"
        path={taskTitle}
        centered
        rightContent={
          assignees.length > 0
            ? <AvatarCluster
              users={assignees.map((u) => ({ name: u.name || u.email || "?", imageUrl: u.profile_picture_url }))}
              onPress={() => router.push(`/comments/${taskId}/assignees`)}
            />
            : undefined
        }
      />
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <View className="flex-1">
          {isLoading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: headerHeight }}>
              <ActivityIndicator color={colors.green} size="large" />
            </View>
          ) : fetchError ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: headerHeight, paddingHorizontal: 24 }}>
              <View className="rounded-xl p-4 w-full items-center border border-danger-border bg-danger-surface">
                <Text className="body-sm text-danger-text text-center mb-3">{fetchError}</Text>
                <TouchableOpacity onPress={() => fetchComments()} className="px-4 py-2 rounded-lg bg-danger">
                  <Text className="btn-md text-white">Prøv igen</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Animated.View style={{ flex: 1, opacity: scrollOpacity }}>
            <ScrollView
              ref={scrollRef}
              keyboardShouldPersistTaps="handled"
              onLayout={() => {
                if (isNearBottomRef.current) scrollRef.current?.scrollToEnd({ animated: false });
                scrollOpacity.setValue(1);
              }}
              onContentSizeChange={() => {
                if (scrollPendingRef.current) {
                  scrollPendingRef.current = false;
                  scrollRef.current?.scrollToEnd({ animated: true });
                } else if (isNearBottomRef.current) {
                  scrollRef.current?.scrollToEnd({ animated: false });
                }
              }}
              onScroll={(e) => {
                const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
                const nearBottom = contentSize.height - layoutMeasurement.height - contentOffset.y < 80;
                isNearBottomRef.current = nearBottom;
                if (nearBottom === showScrollDown) setShowScrollDown(!nearBottom);
              }}
              scrollEventThrottle={100}
              contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 10 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ flex: 1, minHeight: headerHeight + 16 }} />

              {listData.length === 0 ? (
                <View className="items-center">
                  <Text className="body-sm text-muted-foreground text-center">
                    Ingen kommentarer endnu.{"\n"}Skriv den første!
                  </Text>
                </View>
              ) : (
                listData.map((item) => {
                  if (item.type === "timestamp") {
                    return (
                      <Text key={item.key} className="mono-xs text-muted-foreground text-center my-1">
                        {item.label}
                      </Text>
                    );
                  }
                  return (
                    <CommentRow
                      key={item.data.comment_id}
                      marginBottom={item.isLastInGroup ? 8 : 2}
                      highlightPulse={highlightRequest.commentId === item.data.comment_id ? highlightRequest.pulse : 0}
                      onLayout={(event) => {
                        commentLayoutsRef.current.set(item.data.comment_id, event.nativeEvent.layout.y);
                      }}
                    >
                      {currentUser?.user_id === item.data.user_id
                        ? <CommentBubble comment={item.data} isOwn deleted={item.data.deleted} deletedAuthor={item.data.deletedAuthor} isFirstInGroup={item.isFirstInGroup} isLastInGroup={item.isLastInGroup} author={commentAuthors[item.data.user_id] ?? (item.data.user_id === currentUser?.user_id ? currentUser : undefined)} sending={item.data.sending} failed={item.data.failed} errorMessage={item.data.errorMessage} deleteId={item.data.serverCommentId ?? item.data.comment_id} mentionNames={mentionNames} hidden={focusedCommentId === item.data.comment_id} onDelete={isArchived ? undefined : handleDelete} onRetry={isArchived ? undefined : handleRetry} onReply={isArchived || item.data.deleted ? undefined : () => startReply(item.data)} onQuotedCommentPress={item.data.reply_to_comment_id ? () => scrollToQuotedComment(item.data) : undefined} onMenuOpen={(p) => { setMenuParams(p); setMenuVisible(true); requestAnimationFrame(() => setFocusedCommentId(item.data.comment_id)); }} />
                        : <CommentBubble comment={item.data} isOwn={false} deleted={item.data.deleted} deletedAuthor={item.data.deletedAuthor} isFirstInGroup={item.isFirstInGroup} isLastInGroup={item.isLastInGroup} author={commentAuthors[item.data.user_id]} mentionNames={mentionNames} hidden={focusedCommentId === item.data.comment_id} onReply={isArchived || item.data.deleted ? undefined : () => startReply(item.data)} onQuotedCommentPress={item.data.reply_to_comment_id ? () => scrollToQuotedComment(item.data) : undefined} onMenuOpen={(p) => { setMenuParams(p); setMenuVisible(true); requestAnimationFrame(() => setFocusedCommentId(item.data.comment_id)); }} />}
                    </CommentRow>
                  );
                })
              )}

              <Reanimated.View style={scrollSpacerStyle} />
            </ScrollView>
            </Animated.View>
          )}
          {!isLoading && !isArchived && visibleMentionCandidates.length > 0 && (
            <TouchableOpacity
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
              activeOpacity={1}
              onPress={() => setMentionQuery(null)}
            />
          )}
          {!isLoading && !fetchError && (
            <Reanimated.View
              pointerEvents={showScrollDown ? "box-none" : "none"}
              style={[{ position: "absolute", alignSelf: "center" }, isArchived ? { bottom: 8 } : arrowBottomStyle]}
            >
              <Animated.View
                style={{
                  opacity: scrollDownAnim,
                  transform: [{ translateY: scrollDownAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                }}
              >
                <GlassIconButton
                  icon={ArrowDown}
                  onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
                />
              </Animated.View>
            </Reanimated.View>
          )}
        </View>

        {isLoading ? null : isArchived ? (
          <View className="flex-row items-center justify-center gap-1.5 py-3 px-4 bg-surface-subtle border-t border-border">
            <Lock size={13} color={colors.textMuted} strokeWidth={2.2} />
            <Text className="label-sm text-muted-foreground">Arkiveret — kun visning</Text>
          </View>
        ) : (
          <CommentComposer
            inputRef={inputRef}
            value={input}
            onChangeText={handleInputChange}
            onSubmit={handleSubmit}
            canSubmit={canSend && !isSubmitting}
            isSubmitting={isSubmitting}
            pendingAttachments={pendingAttachments}
            replyingTo={replyingTo}
            onPickAttachments={pickAttachments}
            onRemoveAttachment={(id) => setPendingAttachments((prev) => prev.filter((a) => a.id !== id))}
            onCancelReply={() => setReplyingTo(null)}
            onSelectionChange={handleSelectionChange}
            selection={inputSelection}
          />
        )}
      </KeyboardAvoidingView>
      {!isLoading && !isArchived && visibleMentionCandidates.length > 0 && (
        <Reanimated.View
          style={[{ position: "absolute", left: 12, right: 12 }, mentionOverlayStyle]}
          pointerEvents="box-none"
        >
          <MentionSuggestions candidates={visibleMentionCandidates} onSelect={handleMentionSelect} />
        </Reanimated.View>
      )}
      <CommentContextMenu
        visible={menuVisible}
        params={menuParams}
        onClose={() => setMenuVisible(false)}
        onDismissed={() => setFocusedCommentId(null)}
        minTop={headerHeight + 16}
      />
    </View>
  );
}
