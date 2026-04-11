import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { getFileIcon } from "@/helpers/attachmentHelpers";

interface Props {
  uri: string;
  mimeType?: string;
  fileName?: string;
  onRemove: () => void;
}

export default function PendingAttachmentCard({ uri, mimeType, fileName, onRemove }: Props) {
  const isImage = mimeType?.startsWith("image/") ?? true;

  return (
    <View style={{ width: 96, height: 96, borderRadius: 16, overflow: "hidden", borderWidth: 0.5, borderColor: colors.border }}>
      {isImage ? (
        <Image source={{ uri }} style={{ width: 96, height: 96 }} resizeMode="cover" />
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 6 }}>
          <Ionicons name={getFileIcon(mimeType) as any} size={28} color={colors.textPrimary} />
          {fileName ? (
            <Text style={[typography.bodyXs, { color: colors.textMuted, textAlign: "center" }]} numberOfLines={2}>
              {fileName}
            </Text>
          ) : null}
        </View>
      )}
      <TouchableOpacity
        onPress={onRemove}
        style={{ position: "absolute", top: 6, right: 6, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 14, width: 28, height: 28, alignItems: "center", justifyContent: "center" }}
      >
        <Ionicons name="close" size={18} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}
