import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import ImageView from "react-native-image-viewing";
import { TaskAttachment } from "@/types/comment";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import { getFileIcon } from "@/helpers/attachmentHelpers";
import { formatNumber } from "@/helpers/helpers";

interface Props {
  attachments: TaskAttachment[];
  align?: "flex-start" | "flex-end";
}

const STACK_OFFSET = 8;
const MAX_VISIBLE = 3;
const IMAGE_SIZE = 160;


function ImageGrid({ images, align }: { images: TaskAttachment[]; align: "flex-start" | "flex-end" }) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const imageUris = images.map((img) => ({ uri: img.url }));

  if (images.length === 1) {
    return (
      <>
        <TouchableOpacity onPress={() => setViewerIndex(0)} activeOpacity={0.9} style={{ alignSelf: align }}>
          <Image
            source={{ uri: images[0].url }}
            cacheKey={images[0].attachment_id}
            cachePolicy="memory-disk"
            style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 10, borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.border }}
            contentFit="cover"
            transition={200}
          />
        </TouchableOpacity>
        <ImageView images={imageUris} imageIndex={0} visible={viewerIndex !== null} onRequestClose={() => setViewerIndex(null)} />
      </>
    );
  }

  const visibleCount = Math.min(images.length, MAX_VISIBLE);
  const containerSize = IMAGE_SIZE + (visibleCount - 1) * STACK_OFFSET;

  return (
    <>
      <Text style={[typography.bodyXs, { color: colors.textMuted, marginBottom: 6, alignSelf: align }]}>
        {formatNumber(images.length)} billeder
      </Text>
      <View style={{ width: containerSize, height: containerSize, alignSelf: align }}>
        {Array.from({ length: visibleCount }).map((_, i) => {
          const imgIndex = visibleCount - 1 - i;
          const offset = imgIndex * STACK_OFFSET;
          return (
            <TouchableOpacity
              key={images[imgIndex].attachment_id}
              style={{ position: "absolute", top: offset, left: offset }}
              onPress={() => setViewerIndex(imgIndex)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: images[imgIndex].url }}
                cacheKey={images[imgIndex].attachment_id}
                style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 10, borderWidth: 0.5, borderColor: colors.border }}
                contentFit="cover"
                transition={200}
                placeholder={{ color: colors.muted }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      <ImageView images={imageUris} imageIndex={viewerIndex ?? 0} visible={viewerIndex !== null} onRequestClose={() => setViewerIndex(null)} />
    </>
  );
}

export default function CommentAttachments({ attachments, align = "flex-start" }: Props) {
  const images = attachments.filter((a) => a.type === "IMAGE");
  const files = attachments.filter((a) => a.type === "FILE");

  if (attachments.length === 0) return null;

  return (
    <View style={{ gap: 6 }}>
      {images.length > 0 && <ImageGrid images={images} align={align} />}
      {files.map((file) => {
        const isLocal = file.url.startsWith("file://") || file.url.startsWith("content://") || file.url.startsWith("ph://");
        return (
          <TouchableOpacity
            key={file.attachment_id}
            onPress={isLocal ? undefined : () => WebBrowser.openBrowserAsync(file.url)}
            activeOpacity={isLocal ? 1 : 0.7}
            style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.white, borderRadius: 10, borderWidth: 1, borderColor: colors.muted, paddingVertical: 8, paddingHorizontal: 12, width: 220, alignSelf: align }}
          >
            <Ionicons name={getFileIcon(file.mime_type) as any} size={20} color={colors.textPrimary} />
            <Text style={[typography.bodySm, { flex: 1 }]} numberOfLines={1}>{file.file_name ?? "Fil"}</Text>
            {!isLocal && <Ionicons name="open-outline" size={14} color={colors.textMuted} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
