import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { attachmentPickerStore } from "@/lib/attachmentPickerStore";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "@/hooks/useAuth";
import { getTaskComments, createComment, deleteComment, getUser, prepareAttachments, uploadToGcs } from "@/lib/api";
import { formatGroupTimestamp } from "@/helpers/helpers";
import { MAX_FILE_SIZE } from "@/helpers/attachmentHelpers";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import KeyboardInputBar from "@/components/userView/common/KeyboardInputBar";
import PendingAttachmentCard from "@/components/userView/common/PendingAttachmentCard";
import KeyboardInputBarAction from "@/components/userView/common/KeyboardInputBarAction";
import CommentBubble from "./CommentBubble";

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
  const router = useRouter();
  const headerHeight = useModalHeaderHeight();
  const { user: currentUser } = useAuth();
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);
  const isNearBottomRef = useRef(true);
  const hasLoadedRef = useRef(false);

  const [comments, setComments] = useState<DisplayComment[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const fetchComments = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
        setFetchError(null);
      }
      const data = await getTaskComments(taskId);
      setComments(data);
      setFetchError(null);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 50);
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
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, [fetchComments]));

  useEffect(() => () => attachmentPickerStore.clear(), []);

  const pickAttachments = () => {
    attachmentPickerStore.set(async (source: "camera" | "gallery" | "files") => {
      if (source === "files") {
        const result = await DocumentPicker.getDocumentAsync({
          type: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
          multiple: true,
          copyToCacheDirectory: true,
        });
        if (!result.canceled && result.assets.length > 0) {
          const newFiles: PendingAttachment[] = result.assets.map((asset) => ({
            localUri: asset.uri,
            fileName: asset.name || decodeURIComponent(asset.uri.split("/").pop() ?? "") || "Fil",
            mimeType: asset.mimeType ?? "application/octet-stream",
          }));
          setPendingAttachments((prev) => [...prev, ...newFiles]);
          return true;
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
          quality: 0.8,
          allowsMultipleSelection: true,
          selectionLimit: 5,
        });
        if (!result.canceled) { addPickedAssets(result.assets); return true; }
      }
      return false;
    });
    router.push("./add-attachment");
  };

  const addPickedAssets = (assets: ImagePicker.ImagePickerAsset[]) => {
    const ts = Date.now();
    const newAttachments: PendingAttachment[] = assets.map((asset, i) => {
      const mime = asset.mimeType ?? "image/jpeg";
      const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
      return { localUri: asset.uri, fileName: asset.fileName ?? `photo_${ts}_${i}.${ext}`, mimeType: mime };
    });
    setPendingAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleSubmit = async () => {
    if (!taskId || !currentUser) return;
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
        attachment_id: `local-${i}`,
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

    setComments((prev) => [...prev, optimistic]);
    setInput("");
    setPendingAttachments([]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      let upload_tokens: string[] | undefined;

      if (pendingAttachments.length > 0) {
        const blobsWithMeta: { blob: Blob; img: typeof pendingAttachments[0] }[] = [];
        for (const attachment of pendingAttachments) {
          const fileRes = await fetch(attachment.localUri);
          const blob = await fileRes.blob();
          const maxBytes = MAX_FILE_SIZE[attachment.mimeType] ?? 10 * 1024 * 1024;
          if (blob.size > maxBytes) {
            throw new Error(`${attachment.fileName ?? "Fil"} er for stor (max ${maxBytes / (1024 * 1024)} MB)`);
          }
          blobsWithMeta.push({ blob, img: attachment });
        }

        const prepared = await prepareAttachments(
          taskId,
          blobsWithMeta.map(({ blob, img }) => ({
            file_name: img.fileName,
            mime_type: img.mimeType,
            file_size: blob.size,
          })),
        );

        for (let i = 0; i < prepared.length; i++) {
          await uploadToGcs(prepared[i].upload_url, blobsWithMeta[i].blob, blobsWithMeta[i].img.mimeType);
        }

        upload_tokens = prepared.map((p) => p.upload_token);
      }

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
      let upload_tokens: string[] | undefined;

      const fileAttachments = comment.attachments.filter((a) => a.url.startsWith("file://") || a.url.startsWith("ph://"));
      if (fileAttachments.length > 0) {
        const blobsWithMeta: { blob: Blob; mimeType: string; fileName: string }[] = [];
        for (const a of fileAttachments) {
          const res = await fetch(a.url);
          const blob = await res.blob();
          const mimeType = a.mime_type ?? "application/octet-stream";
          const maxBytes = MAX_FILE_SIZE[mimeType] ?? 10 * 1024 * 1024;
          if (blob.size > maxBytes) {
            throw new Error(`${a.file_name ?? "Fil"} er for stor (max ${maxBytes / (1024 * 1024)} MB)`);
          }
          blobsWithMeta.push({ blob, mimeType, fileName: a.file_name ?? "file" });
        }
        const prepared = await prepareAttachments(
          taskId,
          blobsWithMeta.map(({ blob, mimeType, fileName }) => ({ file_name: fileName, mime_type: mimeType, file_size: blob.size })),
        );
        for (let i = 0; i < prepared.length; i++) {
          await uploadToGcs(prepared[i].upload_url, blobsWithMeta[i].blob, blobsWithMeta[i].mimeType);
        }
        upload_tokens = prepared.map((p) => p.upload_token);
      }

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
          <FlatList
            ref={flatListRef}
            data={listData}
            keyExtractor={(item) => item.type === "comment" ? item.data.comment_id : item.key}
            keyboardShouldPersistTaps="handled"
            onLayout={() => { if (isNearBottomRef.current) flatListRef.current?.scrollToEnd({ animated: false }); }}
            onScroll={(e) => {
              const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
              isNearBottomRef.current = contentSize.height - layoutMeasurement.height - contentOffset.y < 80;
            }}
            scrollEventThrottle={100}
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}
            ListHeaderComponent={() => <View style={{ flex: 1, minHeight: headerHeight + 16 }} />}
            ListFooterComponent={() => <View style={{ height: INPUT_BAR_OVERLAP }} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: "center" }}>
                <Text style={[typography.bodySm, { color: colors.textMuted, textAlign: "center" }]}>
                  Ingen kommentarer endnu.{"\n"}Skriv den første!
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              if (item.type === "timestamp") {
                return (
                  <Text style={[typography.monoXs, { color: colors.textMuted, textAlign: "center", marginVertical: 4 }]}>
                    {item.label}
                  </Text>
                );
              }
              return currentUser?.user_id === item.data.user_id
                ? <CommentBubble comment={item.data} isOwn sending={item.data.sending} failed={item.data.failed} errorMessage={item.data.errorMessage} deleteId={item.data.serverCommentId ?? item.data.comment_id} onDelete={handleDelete} onRetry={handleRetry} />
                : <CommentBubble comment={item.data} isOwn={false} author={commentAuthors[item.data.user_id]} />;
            }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </View>

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
    </ModalScreen>
  );
}
