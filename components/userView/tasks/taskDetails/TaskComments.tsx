import { useState, useCallback, useRef, useMemo, useEffect } from "react";
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
import { getTaskComments, createComment, deleteComment, getUser, getTask, prepareAttachments, uploadToGcs } from "@/lib/api";
import { formatGroupTimestamp } from "@/helpers/helpers";
import { MAX_FILE_SIZE } from "@/helpers/attachmentHelpers";
import { TaskComment } from "@/types/comment";
import { TaskStatus } from "@/types/task";
import { User } from "@/types/users";
import { colors } from "@/constants/colors";
import PathHeader, { usePathHeaderHeight } from "@/components/userView/common/PathHeader";
import AvatarCluster from "@/components/userView/common/label/AvatarCluster";
import { PendingAttachmentPreview } from "@/components/userView/common/PendingAttachmentStrip";
import CommentBubble from "./CommentBubble";
import CommentComposer, { INPUT_BAR_OVERLAP, ATTACHMENT_LIST_EXTRA_HEIGHT } from "./CommentComposer";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";

export type PendingAttachment = PendingAttachmentPreview;

type DisplayComment = TaskComment & {
  sending?: boolean;
  failed?: boolean;
  errorMessage?: string;
  serverCommentId?: string;
};

const TIMESTAMP_THRESHOLD_MS = 30 * 60 * 1000;

type ListItem = { type: "comment"; data: DisplayComment } | { type: "timestamp"; key: string; label: string };

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

  const [comments, setComments] = useState<DisplayComment[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, User>>({});
  const [assignees, setAssignees] = useState<User[]>([]);
  const [taskTitle, setTaskTitle] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const scrollDownAnim = useRef(new Animated.Value(0)).current;
  const pendingAttachmentIdRef = useRef(0);

  const { progress } = useReanimatedKeyboardAnimation();
  const composerHeight = INPUT_BAR_OVERLAP + (pendingAttachments.length > 0 ? ATTACHMENT_LIST_EXTRA_HEIGHT : 0);
  const arrowBottomStyle = useAnimatedStyle(() => ({ bottom: composerHeight - progress.value * insets.bottom + 8 }));
  const scrollSpacerStyle = useAnimatedStyle(() => ({ height: isArchived ? 16 : composerHeight - progress.value * insets.bottom }));

  const listData = useMemo<ListItem[]>(() => {
    const result: ListItem[] = [];
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      const prev = comments[i - 1];
      const showTimestamp = !prev || new Date(comment.created_at).getTime() - new Date(prev.created_at).getTime() > TIMESTAMP_THRESHOLD_MS;
      if (showTimestamp) result.push({ type: "timestamp", key: `ts-${comment.comment_id}`, label: formatGroupTimestamp(comment.created_at) });
      result.push({ type: "comment", data: comment });
    }
    return result;
  }, [comments]);

  const uploadAttachments = async (attachments: { uri: string; fileName: string; mimeType: string; fileSize?: number }[]): Promise<string[]> => {
    const processed = await Promise.all(
      attachments.map(async ({ uri, fileName, mimeType, fileSize }) => {
        const isHeicLike = mimeType === "image/heic" || mimeType === "image/heif" || /\.(heic|heif)$/i.test(fileName);
        if (isHeicLike) {
          const converted = await ImageManipulator.manipulateAsync(uri, [], { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG });
          return {
            uri: converted.uri,
            fileName: fileName.replace(/\.[^.]+$/, ".jpg").replace(/^([^.]+)$/, "$1.jpg"),
            mimeType: "image/jpeg",
            fileSize: fileSize ?? 0,
          };
        }
        return { uri, fileName, mimeType, fileSize: fileSize ?? 0 };
      }),
    );
    const prepared = await prepareAttachments(
      taskId,
      processed.map(({ fileName, mimeType, fileSize }) => ({ file_name: fileName, mime_type: mimeType, file_size: fileSize })),
    );
    await Promise.all(prepared.map((p, i) => uploadToGcs(p.upload_url, processed[i].uri, processed[i].mimeType)));
    return prepared.map((p) => p.upload_token);
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
      const [data, taskData] = await Promise.all([getTaskComments(taskId), getTask(taskId)]);
      const archived = taskData.status === TaskStatus.ARCHIVED;
      setIsArchived(archived);
      setTaskTitle(taskData.title);
      setComments(data);
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
    fetchComments(hasLoadedRef.current);
    hasLoadedRef.current = true;
  }, [fetchComments]));

  useEffect(() => () => attachmentPickerStore.clear(), []);

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
          } catch { }
        }
        newAttachments.push({
          id: `pending-image-${ts}-${pendingAttachmentIdRef.current++}`,
          localUri,
          fileName,
          mimeType: mime,
          fileSize: asset.fileSize ?? undefined,
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

  const handleSubmit = async () => {
    if (!taskId || !currentUser) return;
    if (isArchived) return;
    if (!input.trim() && pendingAttachments.length === 0) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

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
        created_at: new Date().toISOString(),
      })),
      sending: true,
    };

    scrollPendingRef.current = true;
    setComments((prev) => [...prev, optimistic]);
    setInput("");
    setPendingAttachments([]);

    try {
      const upload_tokens = pendingAttachments.length > 0
        ? await uploadAttachments(pendingAttachments.map((a) => ({ uri: a.localUri, fileName: a.fileName, mimeType: a.mimeType, fileSize: a.fileSize })))
        : undefined;

      const newComment = await createComment(taskId, {
        ...(optimistic.message && { message: optimistic.message }),
        upload_tokens,
      });

      if (!commentAuthors[newComment.user_id]) {
        try {
          const user = await getUser(newComment.user_id);
          setCommentAuthors((prev) => ({ ...prev, [newComment.user_id]: user }));
        } catch { }
      }

      setComments((prev) => prev.map((c) =>
        c.comment_id === localId
          ? { ...newComment, comment_id: localId, serverCommentId: newComment.comment_id, sending: false }
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
        ? await uploadAttachments(localAttachments.map((a) => ({ uri: a.url, fileName: a.file_name ?? "file", mimeType: a.mime_type ?? "application/octet-stream" })))
        : undefined;

      const newComment = await createComment(taskId, {
        ...(comment.message && { message: comment.message }),
        upload_tokens,
      });

      setComments((prev) => prev.map((c) =>
        c.comment_id === commentId
          ? { ...newComment, comment_id: commentId, serverCommentId: newComment.comment_id, sending: false }
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
      setComments((prev) => prev.filter((c) => c.comment_id !== commentId && c.serverCommentId !== commentId));
    } catch {
      Alert.alert("Fejl", "Kunne ikke slette kommentar");
    }
  };

  const canSend = input.trim().length > 0 || pendingAttachments.length > 0;

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
            <ScrollView
              ref={scrollRef}
              keyboardShouldPersistTaps="handled"
              onLayout={() => { if (isNearBottomRef.current) scrollRef.current?.scrollToEnd({ animated: false }); }}
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
              contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ flex: 1, minHeight: headerHeight + 16 }} />

              {listData.length === 0 ? (
                <View className="items-center">
                  <Text className="body-sm text-muted text-center">
                    Ingen kommentarer endnu.{"\n"}Skriv den første!
                  </Text>
                </View>
              ) : (
                listData.map((item) => {
                  if (item.type === "timestamp") {
                    return (
                      <Text key={item.key} className="mono-xs text-muted text-center my-1">
                        {item.label}
                      </Text>
                    );
                  }
                  return (
                    <View key={item.data.comment_id} className="mb-2">
                      {currentUser?.user_id === item.data.user_id
                        ? <CommentBubble comment={item.data} isOwn sending={item.data.sending} failed={item.data.failed} errorMessage={item.data.errorMessage} deleteId={item.data.serverCommentId ?? item.data.comment_id} onDelete={isArchived ? undefined : handleDelete} onRetry={isArchived ? undefined : handleRetry} />
                        : <CommentBubble comment={item.data} isOwn={false} author={commentAuthors[item.data.user_id]} />}
                    </View>
                  );
                })
              )}

              <Reanimated.View style={scrollSpacerStyle} />
            </ScrollView>
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
            <Text className="label-sm text-muted">Arkiveret — kun visning</Text>
          </View>
        ) : (
          <CommentComposer
            inputRef={inputRef}
            value={input}
            onChangeText={setInput}
            onSubmit={handleSubmit}
            canSubmit={canSend && !isSubmitting}
            isSubmitting={isSubmitting}
            pendingAttachments={pendingAttachments}
            onPickAttachments={pickAttachments}
            onRemoveAttachment={(id) => setPendingAttachments((prev) => prev.filter((a) => a.id !== id))}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
