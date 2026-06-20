import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import ImageView from "react-native-image-viewing";
import { TaskAttachment } from "@/types/comment";
import { colors } from "@/constants/colors";
import { getFileIconComponent } from "@/helpers/attachmentHelpers";

interface Props {
  attachments: TaskAttachment[];
  align?: "flex-start" | "flex-end";
  onLongPress?: () => void;
}

const MAX_W = 220;
const MAX_H = 300;
const MIN_SIZE = 80;
const GRID_GAP = 3;
const THUMB = Math.floor((MAX_W - GRID_GAP) / 2); // ~108

function clampToAspect(naturalW: number, naturalH: number) {
  if (!naturalW || !naturalH) return { w: MAX_W, h: Math.round(MAX_W * 0.75) };
  const ratio = naturalW / naturalH;
  let w = MAX_W;
  let h = MAX_W / ratio;
  if (h > MAX_H) { h = MAX_H; w = MAX_H * ratio; }
  return { w: Math.max(Math.round(w), MIN_SIZE), h: Math.max(Math.round(h), MIN_SIZE) };
}

function SingleImage({ image, onLongPress, allImages, index }: {
  image: TaskAttachment;
  onLongPress?: () => void;
  allImages: TaskAttachment[];
  index: number;
}) {
  const hasStoredDimensions = !!image.width && !!image.height;
  const [size, setSize] = useState(() =>
    hasStoredDimensions
      ? clampToAspect(image.width!, image.height!)
      : { w: MAX_W, h: Math.round(MAX_W * 0.75) }
  );
  const [viewerVisible, setViewerVisible] = useState(false);
  const imageUris = allImages.map((img) => ({ uri: img.url }));

  return (
    <>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setViewerVisible(true)}
        onLongPress={onLongPress}
        delayLongPress={400}
      >
        <Image
          source={{ uri: image.url, cacheKey: image.attachment_id }}
          cachePolicy="memory-disk"
          style={{ width: size.w, height: size.h, borderRadius: 10, backgroundColor: colors.border }}
          contentFit="cover"
          transition={200}
          onLoad={hasStoredDimensions ? undefined : (e) => setSize(clampToAspect(e.source.width, e.source.height))}
        />
      </TouchableOpacity>
      <ImageView
        images={imageUris}
        imageIndex={index}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />
    </>
  );
}

function ImageGrid({ images, align, onLongPress }: {
  images: TaskAttachment[];
  align: "flex-start" | "flex-end";
  onLongPress?: () => void;
}) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const imageUris = images.map((img) => ({ uri: img.url }));

  if (images.length === 1) {
    return (
      <SingleImage
        image={images[0]}
        onLongPress={onLongPress}
        allImages={images}
        index={0}
      />
    );
  }

  // Grid: max 4 visible, "+N" badge on last cell if more
  const MAX_GRID = 4;
  const visible = images.slice(0, MAX_GRID);
  const overflow = images.length - MAX_GRID;
  const rows: TaskAttachment[][] = [];
  for (let i = 0; i < visible.length; i += 2) {
    rows.push(visible.slice(i, i + 2));
  }

  return (
    <>
      <View style={{ width: MAX_W, gap: GRID_GAP, alignSelf: align }}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: "row", gap: GRID_GAP }}>
            {row.map((img, colIndex) => {
              const globalIndex = rowIndex * 2 + colIndex;
              const isLastVisible = globalIndex === MAX_GRID - 1 && overflow > 0;
              return (
                <TouchableOpacity
                  key={img.attachment_id}
                  activeOpacity={1}
                  onPress={() => setViewerIndex(globalIndex)}
                  onLongPress={onLongPress}
                  delayLongPress={400}
                  style={{ flex: 1 }}
                >
                  <View style={{ height: THUMB, borderRadius: 8, overflow: "hidden", backgroundColor: colors.border }}>
                    <Image
                      source={{ uri: img.url, cacheKey: img.attachment_id }}
                      cachePolicy="memory-disk"
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                      transition={200}
                    />
                    {isLastVisible && (
                      <View style={{
                        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.45)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}>+{overflow}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
            {/* Fill empty cell in odd-count last row */}
            {row.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}
      </View>
      <ImageView
        images={imageUris}
        imageIndex={viewerIndex ?? 0}
        visible={viewerIndex !== null}
        onRequestClose={() => setViewerIndex(null)}
      />
    </>
  );
}

export default function CommentAttachments({ attachments, align = "flex-start", onLongPress }: Props) {
  const images = attachments.filter((a) => a.type === "IMAGE");
  const files = attachments.filter((a) => a.type === "FILE");

  if (attachments.length === 0) return null;

  return (
    <View className="gap-1.5">
      {images.length > 0 && <ImageGrid images={images} align={align} onLongPress={onLongPress} />}
      {files.map((file) => {
        const isLocal = file.url.startsWith("file://") || file.url.startsWith("content://") || file.url.startsWith("ph://");
        const FileIcon = getFileIconComponent(file.mime_type);
        const ext = file.file_name?.split(".").pop()?.toUpperCase() ?? "FIL";
        const size = file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : ext;
        const extColor = (() => {
          switch (ext) {
            case "PDF": return colors.red;
            case "DOC":
            case "DOCX": return colors.blue;
            case "XLS":
            case "XLSX": return colors.green;
            default: return colors.textSecondary;
          }
        })();
        return (
          <TouchableOpacity
            key={file.attachment_id}
            onPress={isLocal ? undefined : () => WebBrowser.openBrowserAsync(file.url)}
            onLongPress={onLongPress}
            delayLongPress={400}
            activeOpacity={0.75}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 10,
              backgroundColor: colors.surface,
              borderRadius: 16,
              paddingVertical: 10,
              paddingHorizontal: 12,
              width: 240,
              alignSelf: align,
            }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: extColor, opacity: 0.85, alignItems: "center", justifyContent: "center" }}>
              <FileIcon size={20} color={extColor} fill={colors.white} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text className="body-sm font-semibold" numberOfLines={2}>{file.file_name ?? "Fil"}</Text>
              <Text className="body-xs text-muted-foreground">{size}</Text>

            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
