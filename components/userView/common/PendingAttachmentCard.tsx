import { View, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";

interface Props {
  uri: string;
  onRemove: () => void;
}

export default function PendingAttachmentCard({ uri, onRemove }: Props) {
  return (
    <View style={{ width: 96, height: 96, borderRadius: 16, overflow: "hidden", borderWidth: 0.5, borderColor: colors.border }}>
      <Image source={{ uri }} style={{ width: 96, height: 96 }} resizeMode="cover" />
      <TouchableOpacity
        onPress={onRemove}
        style={{ position: "absolute", top: 6, right: 6, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 14, width: 28, height: 28, alignItems: "center", justifyContent: "center" }}
      >
        <Ionicons name="close" size={18} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}
