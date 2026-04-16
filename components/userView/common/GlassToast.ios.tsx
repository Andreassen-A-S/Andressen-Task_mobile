import { Pressable, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

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
          <Ionicons name="warning-outline" size={22} color="orange" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "Outfit_600SemiBold", fontSize: 15, color: "#1B1D22" }}>{title}</Text>
            <Text style={{ fontFamily: "Outfit_400Regular", fontSize: 13, color: "#6B7280", marginTop: 2 }}>{message}</Text>
          </View>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={16} color="#9CA3AF" />
          </Pressable>
        </View>
      </BlurView>
    </View>
  );
}
