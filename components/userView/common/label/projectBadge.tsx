import { View, Text } from "react-native";
import { MapPin } from "lucide-react-native";
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

const iconSize = { sm: 10, md: 12, lg: 14 };

export default function ProjectBadge({ name, size = "md" }: ProjectBadgeProps) {
  return (
    <View className={containerClass[size]}>
      <MapPin size={iconSize[size]} color={colors.textMuted} />
      <Text style={[typography.badge, { color: colors.textMuted }]} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}
