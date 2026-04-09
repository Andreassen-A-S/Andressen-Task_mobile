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
import { useAuth } from "@/hooks/useAuth";
import { getTaskComments, createComment, deleteComment, getUser, prepareAttachments, uploadToGcs } from "@/lib/api";
import { formatGroupTimestamp } from "@/helpers/helpers";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import KeyboardInputBar from "@/components/userView/common/KeyboardInputBar";
import PendingAttachmentCard from "@/components/userView/common/PendingAttachmentCard";
import KeyboardInputBarAction from "@/components/userView/common/KeyboardInputBarAction";
import OwnUserTaskCommentBubble from "./OwnUserTaskCommentBubble";
import UserTaskCommentBubble from "./UserTaskCommentBubble";

type PendingImage = {
  localUri: string;
  fileName: string;
  mimeType: string;
};

const INPUT_BAR_OVERLAP = 120;
const TIMESTAMP_THRESHOLD_MS = 30 * 60 * 1000;

type ListItem = { type: "comment"; data: TaskComment } | { type: "timestamp"; key: string; label: string };

export default function TaskComments() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const router = useRouter();
  const headerHeight = useModalHeaderHeight();
  const { user: currentUser } = useAuth();
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);
  const isNearBottomRef = useRef(true);
  const hasLoadedRef = useRef(false);

  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
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

  const pickImages = () => {
    attachmentPickerStore.set(async (source: "camera" | "gallery") => {
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
    const newImages: PendingImage[] = assets.map((asset, i) => {
      const mime = asset.mimeType ?? "image/jpeg";
      const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
      return { localUri: asset.uri, fileName: asset.fileName ?? `photo_${ts}_${i}.${ext}`, mimeType: mime };
    });
    setPendingImages((prev) => [...prev, ...newImages]);
  };

  const handleSubmit = async () => {
    if (!input.trim() && pendingImages.length === 0) return;
    try {
      setIsSubmitting(true);
      setInlineError(null);

      let uploadTokens: string[] | undefined;

      if (pendingImages.length > 0) {
        const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

        // 1. Fetch blobs and validate sizes locally
        const blobsWithMeta = await Promise.all(
          pendingImages.map(async (img) => {
            const fileRes = await fetch(img.localUri);
            const blob = await fileRes.blob();
            if (blob.size > MAX_IMAGE_BYTES) throw new Error("Et eller flere billeder er for store (maks 10 MB)");
            return { blob, img };
          }),
        );

        // 2. Prepare — get upload tokens + signed URLs from backend
        const prepared = await prepareAttachments(
          taskId,
          blobsWithMeta.map(({ blob, img }) => ({
            fileName: img.fileName,
            mimeType: img.mimeType,
            fileSize: blob.size,
          })),
        );

        // 3. Upload directly to GCS
        await Promise.all(
          prepared.map(({ uploadUrl }, i) =>
            uploadToGcs(uploadUrl, blobsWithMeta[i].blob, blobsWithMeta[i].img.mimeType),
          ),
        );

        uploadTokens = prepared.map((p) => p.uploadToken);
      }

      // 4. Finalize — create comment, backend confirms tokens atomically
      const newComment = await createComment(taskId, {
        ...(input.trim() && { message: input.trim() }),
        uploadTokens,
      });

      if (!commentAuthors[newComment.user_id]) {
        try {
          const user = await getUser(newComment.user_id);
          setCommentAuthors((prev) => ({ ...prev, [newComment.user_id]: user }));
        } catch { }
      }

      setComments((prev) => [...prev, newComment]);
      setInput("");
      setPendingImages([]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (err) {
      setInlineError(err instanceof Error ? err.message : "Kunne ikke sende besked");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      setInlineError(null);
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.comment_id !== commentId));
    } catch {
      setInlineError("Kunne ikke slette kommentar");
    }
  };

  const canSend = (input.trim().length > 0 || pendingImages.length > 0) && !isSubmitting;

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
                ? <OwnUserTaskCommentBubble comment={item.data} onDelete={handleDelete} />
                : <UserTaskCommentBubble comment={item.data} author={commentAuthors[item.data.user_id]} />;
            }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </View>

      {/* Inline error */}
      {inlineError && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.redLight }}>
          <Text style={[typography.bodyXs, { color: colors.redText, textAlign: "center" }]}>{inlineError}</Text>
        </View>
      )}

      <View style={{ marginTop: -INPUT_BAR_OVERLAP, zIndex: 1 }}>
        <MaskedView
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: INPUT_BAR_OVERLAP }}
          maskElement={
            <LinearGradient
              colors={["transparent", "black", "black"]}
              locations={[0, 0.7, 1]}
              style={{ flex: 1 }}
            />
          }
        >
          <BlurView intensity={7.5} tint="light" style={{ flex: 1 }} />
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
          isSubmitting={isSubmitting}
          canSubmit={canSend}
          leftActions={
            <KeyboardInputBarAction icon="add" onPress={pickImages} disabled={isSubmitting} iconSize={26} />
          }
          attachments={pendingImages.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ marginBottom: 8, marginHorizontal: -8 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 8 }}>
              {pendingImages.map((img) => (
                <PendingAttachmentCard
                  key={img.localUri}
                  uri={img.localUri}
                  onRemove={() => setPendingImages((prev) => prev.filter((i) => i.localUri !== img.localUri))}
                />
              ))}
            </ScrollView>
          ) : undefined}
        />
      </View>
    </ModalScreen>
  );
}
