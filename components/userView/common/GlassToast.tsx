import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  title: string;
  message: string;
  onDismiss: () => void;
}

export function GlassToast({ title, message, onDismiss }: Props) {
  return (
    <View style={{ backgroundColor: "white", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, elevation: 5 }}>
      <Ionicons name="warning-outline" size={22} color="orange" />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Outfit_600SemiBold", fontSize: 15, color: "#1B1D22" }}>{title}</Text>
        <Text style={{ fontFamily: "Outfit_400Regular", fontSize: 13, color: "#6B7280", marginTop: 2 }}>{message}</Text>
      </View>
      <Pressable onPress={onDismiss} hitSlop={8}>
        <Ionicons name="close" size={18} color="#9CA3AF" />
      </Pressable>
    </View>
  );
}
