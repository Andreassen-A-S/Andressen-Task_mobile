import { View, Text } from "react-native";
import { formatNumber } from "@/helpers/helpers";

interface SectionHeaderProps {
  title: string;
  count: number;
  variant?: "overdue" | "default";
}

export default function SectionHeader({ title, count, variant = "default" }: SectionHeaderProps) {
  return (
    <View>
      <View className="flex-row items-center justify-between pt-2.5 bg-background">
        <Text className="label-sm uppercase">{title}</Text>
        <View className={`rounded-2xl px-2 py-0.5 ${variant === "overdue" ? "bg-danger-surface" : "bg-border"}`}>
          <Text className="label-sm uppercase">{formatNumber(count)}</Text>
        </View>
      </View>
    </View>
  );
}
