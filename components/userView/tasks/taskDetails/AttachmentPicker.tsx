import { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { attachmentPickerStore } from "@/lib/attachmentPickerStore";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";

type Option = {
  key: "camera" | "gallery";
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
};

const OPTIONS: Option[] = [
  { key: "camera", icon: "camera-outline", label: "Kamera" },
  { key: "gallery", icon: "image-outline", label: "Galleri" },
];

export default function AttachmentPicker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => () => attachmentPickerStore.clear(), []);

  const select = async (source: "camera" | "gallery") => {
    const cb = attachmentPickerStore.get();
    if (!cb) {
      attachmentPickerStore.clear();
      router.back();
      return;
    }
    const picked = await cb(source);
    if (picked) {
      attachmentPickerStore.clear();
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.eggWhite, paddingBottom: insets.bottom }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 }}>
        <GlassIconButton systemName="xmark" onPress={() => { attachmentPickerStore.clear(); router.back(); }} size="sm" />
        <Text style={[typography.h4, { flex: 1, textAlign: "center", marginRight: 44 }]}>
          Tilføj vedhæftning
        </Text>
      </View>

      {/* Options grid */}
      <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16 }}>
        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => select(opt.key)}
            activeOpacity={0.7}
            style={{ flex: 1, backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.muted, paddingVertical: 20, alignItems: "center", gap: 10 }}
          >
            <Ionicons name={opt.icon} size={28} color={colors.textPrimary} />
            <Text style={typography.bodyMd}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
