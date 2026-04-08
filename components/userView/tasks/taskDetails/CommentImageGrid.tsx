import { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import ImageView from "react-native-image-viewing";
import { TaskAttachment } from "@/types/comment";

interface Props {
  images: TaskAttachment[];
  align?: "flex-start" | "flex-end";
}

const STACK_OFFSET = 8;
const MAX_VISIBLE = 3;
const IMAGE_SIZE = 160;

export default function CommentImageGrid({ images, align = "flex-start" }: Props) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const imageUris = images.map((img) => ({ uri: img.public_url }));

  if (images.length === 1) {
    return (
      <>
        <TouchableOpacity onPress={() => setViewerIndex(0)} activeOpacity={0.9} style={{ alignSelf: align }}>
          <Image source={{ uri: images[0].public_url }} style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 10 }} resizeMode="cover" />
        </TouchableOpacity>
        <ImageView images={imageUris} imageIndex={0} visible={viewerIndex !== null} onRequestClose={() => setViewerIndex(null)} />
      </>
    );
  }

  const visibleCount = Math.min(images.length, MAX_VISIBLE);
  const hiddenCount = images.length - visibleCount;
  const containerSize = IMAGE_SIZE + (visibleCount - 1) * STACK_OFFSET;

  return (
    <>
      <Text style={[typography.bodyXs, { color: colors.textMuted, marginBottom: 6, alignSelf: align }]}>
        {images.length} billeder
      </Text>
      <View style={{ width: containerSize, height: containerSize, alignSelf: align }}>
        {/* Render back to front so front image renders on top */}
        {Array.from({ length: visibleCount }).map((_, i) => {
          const imgIndex = visibleCount - 1 - i; // i=0 → back image, i=visibleCount-1 → front (images[0])
          const offset = imgIndex * STACK_OFFSET;
          const isBack = i === 0;

          return (
            <TouchableOpacity
              key={images[imgIndex].attachment_id}
              style={{ position: "absolute", top: offset, left: offset }}
              onPress={() => setViewerIndex(imgIndex)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: images[imgIndex].public_url }}
                style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 10 }}
                resizeMode="cover"
              />
              {isBack && hiddenCount > 0 && (
                <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "white", fontSize: 22, fontWeight: "600" }}>+{hiddenCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
