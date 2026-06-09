import { View, Text, TouchableOpacity } from "react-native";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export default function ErrorState({ message = "Noget gik galt.", onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3">
      <Text className="body-md">{message}</Text>
      <TouchableOpacity
        onPress={onRetry}
        className="px-5 py-2 rounded-full bg-white border border-border"
      >
        <Text className="btn-md">Prøv igen</Text>
      </TouchableOpacity>
    </View>
  );
}
