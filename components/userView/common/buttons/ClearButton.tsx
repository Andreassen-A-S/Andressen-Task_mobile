import { Pressable, Text } from "react-native";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";

interface Props {
  label: string;
  onPress: () => void;
}

export default function ClearButton({ label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        marginTop: 24,
        paddingHorizontal: 32,
        paddingVertical: 14,
        alignSelf: "center",
        opacity: pressed ? 0.5 : 1,
      })}
    >
      <Text style={[typography.bodyMd, { color: colors.red }]}>{label}</Text>
    </Pressable>
  );
}
