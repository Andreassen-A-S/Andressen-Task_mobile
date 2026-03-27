import { View, Pressable, Text } from "react-native";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

interface Props {
  label: string;
  onPress: () => void;
}

export default function GlassTextButton({ label, onPress }: Props) {
  return (
    <View style={{
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    }}>
      <Pressable
        onPress={onPress}
        android_ripple={{ color: colors.border, borderless: false }}
        style={{ paddingVertical: 8, paddingHorizontal: 14, alignItems: "center" }}
      >
        <Text style={typography.btnMd}>{label}</Text>
      </Pressable>
    </View>
  );
}
