import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { X } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { getFileIconComponent } from "@/helpers/attachmentHelpers";

interface Props {
  uri: string;
  mimeType?: string;
  fileName?: string;
  onRemove: () => void;
}

export default function PendingAttachmentCard({ uri, mimeType, fileName, onRemove }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const isHeicLike = mimeType === "image/heic" || mimeType === "image/heif" || /\.(heic|heif)$/i.test(fileName ?? uri);
  const isImage = (mimeType?.startsWith("image/") ?? true) && !isHeicLike && !imageFailed;
  const FileIcon = getFileIconComponent(mimeType);

  return (
    // Keep the parent unclipped. Clipping this wrapper can make the first pending attachment render invisible on iOS.
    <View
      className="w-24 h-24 rounded-2xl border border-border"
      style={{ width: 96, height: 96, backgroundColor: colors.muted }}
    >
      {isImage ? (
        <Image
          source={{ uri }}
          cachePolicy="none"
          style={{ width: 96, height: 96, borderRadius: 16, backgroundColor: colors.border }}
          contentFit="cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View
          className="flex-1 bg-white items-center justify-center gap-1 px-1.5"
          style={{ borderRadius: 16 }}
        >
          <FileIcon size={28} color={colors.textPrimary} strokeWidth={2.1} />
          {fileName ? (
            <Text className="body-xs text-muted text-center" numberOfLines={2}>
              {fileName}
            </Text>
          ) : null}
        </View>
      )}
      <TouchableOpacity
        onPress={onRemove}
        className="absolute top-1.5 right-1.5 bg-black/50 rounded-full w-7 h-7 items-center justify-center"
        style={{ zIndex: 2, elevation: 2 }}
      >
        <X size={18} color={colors.white} strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );
}
