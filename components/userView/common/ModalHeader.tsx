import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { typography } from "@/constants/typography";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";

interface Props {
  title?: string;
}

export default function ModalHeader({ title }: Props) {
  const router = useRouter();

  return (
    <View className="absolute left-0 right-0 top-0 z-10 pt-5" style={{ height: 56 }}>
      <LinearGradient
        colors={["rgba(246,245,241,0.9)", "rgba(246,245,241,0)"]}
        locations={[0, 0.8, 1]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View className="flex-row items-center justify-between px-4 h-14">
        <GlassIconButton systemName="xmark" onPress={() => router.back()} variant="lg" />
        <Text style={typography.h4} numberOfLines={1}>{title ?? ""}</Text>
        <View style={{ width: 44 }} />
      </View>
    </View>
  );
}
