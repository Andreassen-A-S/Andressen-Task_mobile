import { Pressable, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { TriangleAlert, X } from "lucide-react-native";

interface Props {
  title: string;
  message: string;
  onDismiss: () => void;
}

export function GlassToast({ title, message, onDismiss }: Props) {
  return (
    <View style={{ borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16 }}>
      <BlurView
        intensity={60}
        tint="systemMaterial"
        style={{ borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.6)" }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: "rgba(255,255,255,0.35)" }}>
          <TriangleAlert size={22} color="orange" strokeWidth={2.2} />
          <View style={{ flex: 1 }}>
            <Text className="btn-lg text-charcoal">{title}</Text>
            <Text className="body-xs mt-0.5">{message}</Text>
          </View>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <X size={16} color="#9CA3AF" strokeWidth={2.2} />
          </Pressable>
        </View>
      </BlurView>
    </View>
  );
}
