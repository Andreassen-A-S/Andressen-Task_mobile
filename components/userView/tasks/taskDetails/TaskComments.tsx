import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter } from "expo-router";
import { attachmentPickerStore } from "@/lib/attachmentPickerStore";
import { showToast } from "@/lib/toast";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "@/hooks/useAuth";
import { getTaskComments, createComment, deleteComment, getUser, getTask, prepareAttachments, uploadToGcs } from "@/lib/api";
import { formatGroupTimestamp } from "@/helpers/helpers";
import { MAX_FILE_SIZE } from "@/helpers/attachmentHelpers";
import { TaskComment } from "@/types/comment";
import { TaskStatus } from "@/types/task";
import { User } from "@/types/users";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import KeyboardInputBar from "@/components/userView/common/KeyboardInputBar";
import KeyboardSafeAreaSpacer from "@/components/userView/common/KeyboardSafeAreaSpacer";
import PendingAttachmentCard from "@/components/userView/common/PendingAttachmentCard";
import KeyboardInputBarAction from "@/components/userView/common/KeyboardInputBarAction";
import CommentBubble from "./CommentBubble";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";

type PendingAttachment = {
  localUri: string;
  fileName: string;
  mimeType: string;
};

type DisplayComment = TaskComment & {
  sending?: boolean;
  failed?: boolean;
  errorMessage?: string;
  serverCommentId?: string;
};

const INPUT_BAR_OVERLAP = 120;
const TIMESTAMP_THRESHOLD_MS = 30 * 60 * 1000;

type ListItem = { type: "comment"; data: DisplayComment } | { type: "timestamp"; key: string; label: string };

export default function TaskComments() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [isArchived, setIsArchived] = useState(false);
  const router = useRouter();
  const headerHeight = useModalHeaderHeight();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useAuth();
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const isNearBottomRef = useRef(true);
  const hasLoadedRef = useRef(false);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollPendingRef = useRef(false);

  const [comments, setComments] = useState<DisplayComment[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const scrollDownAnim = useRef(new Animated.Value(0)).current;

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

  const uploadAttachments = async (attachments: Array<{ uri: string; fileName: string; mimeType: string }>): Promise<string[]> => {
    const blobsWithMeta = await Promise.all(
      attachments.map(async ({ uri, fileName, mimeType }) => {
        const blob = await fetch(uri).then((r) => r.blob());
        const maxBytes = MAX_FILE_SIZE[mimeType] ?? 10 * 1024 * 1024;
        if (blob.size > maxBytes) throw new Error(`${fileName} er for stor (max ${maxBytes / (1024 * 1024)} MB)`);
        return { blob, fileName, mimeType };
      }),
    );
    const prepared = await prepareAttachments(
      taskId,
      blobsWithMeta.map(({ blob, fileName, mimeType }) => ({ file_name: fileName, mime_type: mimeType, file_size: blob.size })),
    );
    await Promise.all(prepared.map((p, i) => uploadToGcs(p.upload_url, blobsWithMeta[i].blob, blobsWithMeta[i].mimeType)));
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
      setComments(data);
      if (!archived && !silent) {
        if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
        focusTimerRef.current = setTimeout(() => inputRef.current?.focus(), 600);
      }
      setFetchError(null);
      const uniqueIds = [...new Set(data.map((c) => c.user_id))];
      const authors: Record<string, User> = {};
      await Promise.all(uniqueIds.map(async (id) => {
        try { authors[id] = await getUser(id); } catch { }
      }));
      setCommentAuthors(authors);
    } catch {
      if (!silent) setFetchError("Kunne ikke hente kommentarer");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [taskId]);

  useFocusEffect(useCallback(() => {
    fetchComments(hasLoadedRef.current);
    hasLoadedRef.current = true;
    return () => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    };
  }, [fetchComments]));

  useEffect(() => () => attachmentPickerStore.clear(), []);

  useEffect(() => {
    Animated.spring(scrollDownAnim, {
      toValue: showScrollDown ? 1 : 0,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
  }, [showScrollDown]);

  const addPickedAssets = (assets: ImagePicker.ImagePickerAsset[]) => {
    const ts = Date.now();
    const newAttachments: PendingAttachment[] = [];
    const oversized: string[] = [];

    assets.forEach((asset, i) => {
      const mime = asset.mimeType ?? "image/jpeg";
      const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
      const fileName = asset.fileName ?? `photo_${ts}_${i}.${ext}`;
      const maxBytes = MAX_FILE_SIZE[mime] ?? 10 * 1024 * 1024;
      if (asset.fileSize != null && asset.fileSize > maxBytes) {
        oversized.push(fileName);
      } else {
        newAttachments.push({ localUri: asset.uri, fileName, mimeType: mime });
      }
    });

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
              newFiles.push({ localUri: asset.uri, fileName: name, mimeType });
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
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
        if (!result.canceled) { addPickedAssets(result.assets); return true; }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Tilladelse krævet", "Adgang til fotobiblioteket er nødvendig.");
          return false;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          selectionLimit: 20,
        });
        if (!result.canceled) { addPickedAssets(result.assets); return true; }
      }
      return false;
    });
    router.push("./add-attachment");
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
        ? await uploadAttachments(pendingAttachments.map((a) => ({ uri: a.localUri, fileName: a.fileName, mimeType: a.mimeType })))
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
    <ModalScreen title="Kommentarer">
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}>
        <View style={{ flex: 1 }}>
          {isLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: headerHeight }}>
            <ActivityIndicator color={colors.green} size="large" />
          </View>
        ) : fetchError ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: headerHeight, paddingHorizontal: 24 }}>
            <View style={{ borderRadius: 12, padding: 16, width: "100%", alignItems: "center", borderWidth: 1, backgroundColor: colors.redLight, borderColor: colors.redBorder }}>
              <Text style={[typography.bodySm, { color: colors.redText, textAlign: "center", marginBottom: 12 }]}>{fetchError}</Text>
              <TouchableOpacity onPress={() => fetchComments()} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.red }}>
                <Text style={typography.btnMdWhite}>Prøv igen</Text>
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
              <View style={{ alignItems: "center" }}>
                <Text style={[typography.bodySm, { color: colors.textMuted, textAlign: "center" }]}>
                  Ingen kommentarer endnu.{"\n"}Skriv den første!
                </Text>
              </View>
            ) : (
              listData.map((item) => {
                if (item.type === "timestamp") {
                  return (
                    <Text key={item.key} style={[typography.monoXs, { color: colors.textMuted, textAlign: "center", marginVertical: 4 }]}>
                      {item.label}
                    </Text>
                  );
                }
                return (
                  <View key={item.data.comment_id} style={{ marginBottom: 8 }}>
                    {currentUser?.user_id === item.data.user_id
                      ? <CommentBubble comment={item.data} isOwn sending={item.data.sending} failed={item.data.failed} errorMessage={item.data.errorMessage} deleteId={item.data.serverCommentId ?? item.data.comment_id} onDelete={isArchived ? undefined : handleDelete} onRetry={isArchived ? undefined : handleRetry} />
                      : <CommentBubble comment={item.data} isOwn={false} author={commentAuthors[item.data.user_id]} />}
                  </View>
                );
              })
            )}

            <View style={{ height: isArchived ? 16 : INPUT_BAR_OVERLAP }} />
          </ScrollView>
        )}
        {!isLoading && !fetchError && (
          <Animated.View
            pointerEvents={showScrollDown ? "box-none" : "none"}
            style={{
              position: "absolute",
              bottom: isArchived ? 8 : INPUT_BAR_OVERLAP + 8,
              alignSelf: "center",
              opacity: scrollDownAnim,
              transform: [{ translateY: scrollDownAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            }}
          >
            <GlassIconButton
              systemName="arrow.down"
              onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
              size="lg"
            />
          </Animated.View>
        )}
        </View>

      {isLoading ? null : isArchived ? (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingTop: 12, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: colors.muted, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Ionicons name="lock-closed-outline" size={13} color={colors.textMuted} />
          <Text style={[typography.labelSm, { color: colors.textMuted }]}>Arkiveret — kun visning</Text>
        </View>
      ) : (
        <View style={{ marginTop: -INPUT_BAR_OVERLAP, zIndex: 1 }}>
          <MaskedView
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: INPUT_BAR_OVERLAP }}
            pointerEvents="none"
            maskElement={
              <LinearGradient
                colors={["transparent", "black", "black"]}
                locations={[0, 0.7, 1]}
                style={{ flex: 1 }}
              />
            }
          >
            <BlurView intensity={7.5} tint="light" style={{ flex: 1 }} pointerEvents="none" />
          </MaskedView>
          <LinearGradient
            colors={[`${colors.eggWhite}00`, `${colors.eggWhite}CC`]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: INPUT_BAR_OVERLAP }}
            pointerEvents="none"
          />
          <KeyboardInputBar
            inputRef={inputRef}
            value={input}
            onChangeText={setInput}
            onSubmit={handleSubmit}
            canSubmit={canSend && !isSubmitting}
            isSubmitting={isSubmitting}
            leftActions={
              <KeyboardInputBarAction icon="add" onPress={pickAttachments} iconSize={26} disabled={isSubmitting} />
            }
            attachments={pendingAttachments.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ marginBottom: 8, marginHorizontal: -8 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 8 }}>
                {pendingAttachments.map((attachment) => (
                  <PendingAttachmentCard
                    key={attachment.localUri}
                    uri={attachment.localUri}
                    mimeType={attachment.mimeType}
                    fileName={attachment.fileName}
                    onRemove={() => setPendingAttachments((prev) => prev.filter((a) => a.localUri !== attachment.localUri))}
                  />
                ))}
              </ScrollView>
            ) : undefined}
          />
        </View>
      )}
      </KeyboardAvoidingView>
      <KeyboardSafeAreaSpacer bottomInset={insets.bottom} />
    </ModalScreen>
  );
}
