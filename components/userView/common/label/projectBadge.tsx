import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/constants/typography";
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

const iconSize = { sm: 12, md: 13, lg: 13 };

export default function ProjectBadge({ name, size = "md" }: ProjectBadgeProps) {
  return (
    <View className={containerClass[size]}>
      <Ionicons name="location-sharp" size={iconSize[size]} color={colors.textMuted} />
      <Text style={[typography.badge, { color: colors.textMuted }]} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}
