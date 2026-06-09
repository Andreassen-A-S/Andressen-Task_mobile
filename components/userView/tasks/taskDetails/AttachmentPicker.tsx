import { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Camera, File, ImageUp, X, type LucideIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { attachmentPickerStore } from "@/lib/attachmentPickerStore";
import { colors } from "@/constants/colors";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";

type Option = {
  key: "camera" | "gallery" | "files";
  icon: LucideIcon;
  label: string;
};

const OPTIONS: Option[] = [
  { key: "camera", icon: Camera, label: "Kamera" },
  { key: "gallery", icon: ImageUp, label: "Galleri" },
  { key: "files", icon: File, label: "Filer" },
];

export default function AttachmentPicker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => () => attachmentPickerStore.clear(), []);

  const select = async (source: "camera" | "gallery" | "files") => {
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
    <View className="flex-1 bg-background" style={{ paddingBottom: insets.bottom }}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-5">
        <GlassIconButton icon={X} onPress={() => { attachmentPickerStore.clear(); router.back(); }} size="lg" />
        <Text className="h4 flex-1 text-center mr-11">
          Tilføj vedhæftning
        </Text>
      </View>

      {/* Options grid */}
      <View className="flex-row gap-3 px-4">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;

          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => select(opt.key)}
              activeOpacity={0.7}
              className="flex-1 bg-white rounded-2xl border border-muted py-5 items-center gap-2.5"
            >
              <Icon size={28} color={colors.textPrimary} strokeWidth={2.2} />
              <Text className="body-md">{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
