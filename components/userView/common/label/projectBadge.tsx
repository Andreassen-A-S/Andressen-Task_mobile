import { View, Text } from "react-native";
import { MapPinned } from "lucide-react-native";
import { colors } from "@/constants/colors";

interface ProjectBadgeProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const containerClass = {
  sm: "flex-row items-center gap-1",
  md: "flex-row items-center gap-1.5",
  lg: "flex-row items-center gap-1.5",
};

const iconSize = { sm: 10, md: 12, lg: 14 };

export default function ProjectBadge({ name, size = "md" }: ProjectBadgeProps) {
  return (
    <View className={containerClass[size]}>
      <MapPinned size={iconSize[size]} color={colors.textMuted} />
      <Text className="badge-md text-muted-foreground" numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}
