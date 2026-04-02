import { View, Text } from "react-native";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";

interface SectionHeaderProps {
  title: string;
  count: number;
  variant?: "overdue" | "default";
}

export default function SectionHeader({ title, count, variant = "default" }: SectionHeaderProps) {
  return (
    <View>
      <View className="flex-row items-center justify-between pt-2.5 bg-[#F6F5F1]">
        <Text style={typography.labelSmUppercase}>{title}</Text>
        <View
          className="rounded-2xl px-2 py-0.5"
          style={{ backgroundColor: variant === "overdue" ? colors.redLight : colors.border }}
        >
          <Text style={typography.labelSmUppercase}>{count}</Text>
        </View>
      </View>
    </View>
  );
}
