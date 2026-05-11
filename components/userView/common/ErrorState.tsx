import { View, Text, TouchableOpacity } from "react-native";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export default function ErrorState({ message = "Noget gik galt.", onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3">
      <Text style={typography.bodyMd}>{message}</Text>
      <TouchableOpacity
        onPress={onRetry}
        className="px-5 py-2 rounded-full bg-white"
        style={{ borderWidth: 1, borderColor: colors.border }}
      >
        <Text style={typography.btnMd}>Prøv igen</Text>
      </TouchableOpacity>
    </View>
  );
}
