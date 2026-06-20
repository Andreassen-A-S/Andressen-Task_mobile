import { Image, type ImageLoadEventData, type NativeSyntheticEvent, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { Paperclip, Reply, X } from "lucide-react-native";
import { colors } from "@/constants/colors";

interface Props {
  authorName: string;
  isOwn?: boolean;
  preview: string;
  attachmentUrl?: string;
  attachmentWidth?: number;
  attachmentHeight?: number;
  deleted?: boolean;
  variant: "own" | "other" | "composer";
  replyingAuthorName?: string;
  replyingToSelf?: boolean;
  onCancel?: () => void;
}

const REPLY_IMAGE_MAX_SIZE = 140;
const replyImageSizeCache = new Map<string, { width: number; height: number }>();

function getReplyImageSize(width: number, height: number) {
  const scale = Math.min(REPLY_IMAGE_MAX_SIZE / width, REPLY_IMAGE_MAX_SIZE / height);
  return { width: width * scale, height: height * scale };
}

function ReplyImage({ uri, width, height }: { uri: string; width?: number; height?: number }) {
  const hasStoredDimensions = !!width && !!height;
  const [size, setSize] = useState(() =>
    hasStoredDimensions
      ? getReplyImageSize(width!, height!)
      : replyImageSizeCache.get(uri) ?? { width: 72, height: 72 }
  );

  const handleLoad = ({ nativeEvent }: NativeSyntheticEvent<ImageLoadEventData>) => {
    const { width, height } = nativeEvent.source;
    if (!width || !height) return;

    if (hasStoredDimensions) return;
    const nextSize = getReplyImageSize(width, height);
    replyImageSizeCache.set(uri, nextSize);
    setSize(nextSize);
  };

  return (
    <View style={{ ...size, borderRadius: 14, overflow: "hidden" }}>
      <Image
        source={{ uri }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="contain"
        onLoad={handleLoad}
        fadeDuration={0}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: "rgba(255, 255, 255, 0.22)",
        }}
      />
    </View>
  );
}

export default function CommentReplyPreview({
  authorName,
  isOwn = false,
  preview,
  attachmentUrl,
  attachmentWidth,
  attachmentHeight,
  deleted = false,
  variant,
  replyingAuthorName,
  replyingToSelf = false,
  onCancel,
}: Props) {
  const isOwnMessage = variant === "own";
  const isComposer = variant === "composer";
  const isAttachmentOnly = preview === "Vedhæftning";
  const isImageOnly = isAttachmentOnly && !!attachmentUrl;
  const attachmentLabel = isImageOnly ? "Billede" : "Vedhæftet fil";

  if (!isComposer) {
    const replyLabel = isOwnMessage
      ? replyingToSelf
        ? "Du har svaret dig selv"
        : `Du har svaret ${authorName}`
      : replyingToSelf
        ? `${replyingAuthorName ?? "Brugeren"} har svaret sig selv`
        : `${replyingAuthorName ?? "Brugeren"} har svaret ${authorName}`;

    return (
      <View style={{ alignItems: isOwnMessage ? "flex-end" : "flex-start" }}>
        <View className="flex-row items-center gap-1.5 mb-1 px-1">
          <Reply size={14} color={colors.textMuted} strokeWidth={2.2} />
          <Text className="body-xs text-muted-foreground" numberOfLines={1}>
            {replyLabel}
          </Text>
        </View>
        {deleted ? (
          <View
            style={{
              maxWidth: "100%",
              borderRadius: 18,
              borderBottomRightRadius: isOwnMessage ? 7 : 18,
              borderBottomLeftRadius: isOwnMessage ? 18 : 7,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Text className="body-md !text-muted-foreground" >Kommentar slettet</Text>
          </View>
        ) : isImageOnly ? (
          <ReplyImage uri={attachmentUrl} width={attachmentWidth} height={attachmentHeight} />
        ) : (
          <View
            className="bg-surface-hover px-3 py-2"
            style={{
              maxWidth: "100%",
              borderRadius: 18,
              borderBottomRightRadius: isOwnMessage ? 7 : 18,
              borderBottomLeftRadius: isOwnMessage ? 18 : 7,
            }}
          >
            {isAttachmentOnly ? (
              <View className="flex-row items-center gap-1">
                <Paperclip size={14} color={colors.textSecondary} strokeWidth={2} />
                <Text className="body-xs !text-secondary" >
                  {attachmentLabel}
                </Text>
              </View>
            ) : (
              <Text className="body-md !text-secondary" numberOfLines={3}>{preview}</Text>
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-3">
      <View className="flex-1">
        <Text className="body-md text-primary" numberOfLines={1}>
          {isOwn ? "Svarer dig selv" : `Svarer ${authorName}`}
        </Text>
        {!isImageOnly || deleted ? (
          deleted ? (
            <Text className="body-sm !text-muted-foreground mt-1"  numberOfLines={1}>Kommentar slettet</Text>
          ) : isAttachmentOnly ? (
            <View className="flex-row items-center gap-1 mt-1">
              <Paperclip size={13} color={colors.textSecondary} strokeWidth={2} />
              <Text className="body-sm text-secondary" >
                {attachmentLabel}
              </Text>
            </View>
          ) : (
            <Text className="body-sm text-secondary mt-1" numberOfLines={1}>{preview}</Text>
          )
        ) : null}
      </View>
      {isImageOnly ? (
        <Image
          source={{ uri: attachmentUrl }}
          style={{ width: 48, height: 48, borderRadius: 9 }}
          resizeMode="cover"
        />
      ) : null}
      {onCancel ? (
        <TouchableOpacity
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Annuller svar"
          className="h-10 w-10 items-center justify-center rounded-full bg-muted"
        >
          <X size={22} color={colors.textPrimary} strokeWidth={2.6} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
