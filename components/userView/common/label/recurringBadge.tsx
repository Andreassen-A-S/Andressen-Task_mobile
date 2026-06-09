import { View, Text } from "react-native";
import { Repeat } from "lucide-react-native";
import { colors } from "@/constants/colors";

interface RecurringBadgeProps {
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
}

const containerSize = {
  sm: "flex-row items-center gap-1.5 px-2 h-5",
  md: "flex-row items-center gap-1.5 px-2.5 h-6",
  lg: "flex-row items-center gap-1.5 px-3 h-7",
};

const iconOnlySize = {
  sm: "items-center justify-center h-5 w-5",
  md: "items-center justify-center h-6 w-6",
  lg: "items-center justify-center h-7 w-7",
};

const iconSize = { sm: 10, md: 12, lg: 14 };
const textSize = { sm: "badge-sm", md: "badge-md", lg: "badge-lg" };

export default function RecurringBadge({ size = "md", iconOnly = false }: RecurringBadgeProps) {
  return (
    <View className={`bg-info-surface rounded-lg ${iconOnly ? iconOnlySize[size] : containerSize[size]}`}>
      <Repeat size={iconSize[size]} color={colors.blue} />
      {!iconOnly && <Text className={`text-link ${textSize[size]}`}>Gentages</Text>}
    </View>
  );
}
