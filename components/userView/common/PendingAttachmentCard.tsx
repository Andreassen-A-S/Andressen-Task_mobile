import { View, Text, Image, TouchableOpacity } from "react-native";
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
  const isImage = mimeType?.startsWith("image/") ?? true;
  const FileIcon = getFileIconComponent(mimeType);

  return (
    <View className="w-24 h-24 rounded-2xl overflow-hidden border border-border" style={{ width: 96, height: 96 }}>
      {isImage ? (
        <Image source={{ uri }} className="w-24 h-24" style={{ width: 96, height: 96 }} resizeMode="cover" />
      ) : (
        <View className="flex-1 bg-white items-center justify-center gap-1 px-1.5">
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
      >
        <X size={18} color={colors.white} strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );
}
