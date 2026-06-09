import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { ExternalLink } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import ImageView from "react-native-image-viewing";
import { TaskAttachment } from "@/types/comment";
import { colors } from "@/constants/colors";
import { getFileIconComponent } from "@/helpers/attachmentHelpers";
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
          <View style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 10, overflow: "hidden", borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.border }}>
            <Image
              source={{ uri: images[0].url, cacheKey: images[0].attachment_id }}
              cachePolicy="memory-disk"
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={200}
            />
          </View>
        </TouchableOpacity>
        <ImageView images={imageUris} imageIndex={0} visible={viewerIndex !== null} onRequestClose={() => setViewerIndex(null)} />
      </>
    );
  }

  const visibleCount = Math.min(images.length, MAX_VISIBLE);
  const containerSize = IMAGE_SIZE + (visibleCount - 1) * STACK_OFFSET;

  return (
    <>
      <Text className="body-xs text-muted mb-1.5" style={{ alignSelf: align }}>
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
              <View style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 10, overflow: "hidden", borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.muted }}>
                <Image
                  source={{ uri: images[imgIndex].url, cacheKey: images[imgIndex].attachment_id }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  transition={200}
                />
              </View>
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
    <View className="gap-1.5">
      {images.length > 0 && <ImageGrid images={images} align={align} />}
      {files.map((file) => {
        const isLocal = file.url.startsWith("file://") || file.url.startsWith("content://") || file.url.startsWith("ph://");
        const FileIcon = getFileIconComponent(file.mime_type);
        return (
          <TouchableOpacity
            key={file.attachment_id}
            onPress={isLocal ? undefined : () => WebBrowser.openBrowserAsync(file.url)}
            activeOpacity={isLocal ? 1 : 0.7}
            className="flex-row items-center gap-2 bg-white rounded-[10px] border border-muted py-2 px-3 w-[220px]"
            style={{ alignSelf: align }}
          >
            <FileIcon size={20} color={colors.textPrimary} strokeWidth={2.1} />
            <Text className="body-sm flex-1" numberOfLines={1}>{file.file_name ?? "Fil"}</Text>
            {!isLocal && <ExternalLink size={14} color={colors.textMuted} strokeWidth={2.1} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
