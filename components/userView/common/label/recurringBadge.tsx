import { View, Text } from "react-native";
import { Repeat } from "lucide-react-native";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";

interface RecurringBadgeProps {
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
}

const containerClass = {
  sm: "flex-row items-center gap-1.5 rounded-lg px-2 h-5 bg-[#EBF0FD]",
  md: "flex-row items-center gap-1.5 rounded-lg px-2.5 h-6 bg-[#EBF0FD]",
  lg: "flex-row items-center gap-1.5 rounded-lg px-3 h-7 bg-[#EBF0FD]",
};

const iconOnlyClass = {
  sm: "items-center justify-center rounded-lg h-5 w-5 bg-[#EBF0FD]",
  md: "items-center justify-center rounded-lg h-6 w-6 bg-[#EBF0FD]",
  lg: "items-center justify-center rounded-lg h-7 w-7 bg-[#EBF0FD]",
};

const iconSize = { sm: 10, md: 12, lg: 14 };

export default function RecurringBadge({ size = "md", iconOnly = false }: RecurringBadgeProps) {
  return (
    <View className={iconOnly ? iconOnlyClass[size] : containerClass[size]}>
      <Repeat size={iconSize[size]} color={colors.blue} />
      {!iconOnly && <Text style={[typography.badge, { color: colors.blue }]}>Gentages</Text>}
    </View>
  );
}
