import { View, Text, Platform, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";
import { colors } from "@/constants/colors";
import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";

interface Props {
  title?: string;
  sub?: string;
  rightContent?: ReactNode;
  onClose?: () => void;
  style?: ViewStyle | object;
  pointerEvents?: "none" | "box-none" | "box-only" | "auto";
}

export default function ModalHeader({ title, sub, rightContent, onClose, style, pointerEvents }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topSpacing = Platform.OS === "ios" ? 12 : insets.top;
  const headerHeight = topSpacing + (sub ? 68 : 56);

  return (
    <Animated.View style={[{ position: "absolute", left: 0, right: 0, top: 0, zIndex: 10, height: headerHeight }, style]} pointerEvents={pointerEvents}>
      {Platform.OS === "ios" && (
        <MaskedView
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          maskElement={
            <LinearGradient
              colors={["black", "black", "transparent"]}
              locations={[0, 0.8, 1]}
              style={{ flex: 1 }}
            />
          }
        >
          <BlurView intensity={7.5} tint="light" style={{ flex: 1 }} />
        </MaskedView>
      )}
      <LinearGradient
        colors={[`${colors.eggWhite}CC`, `${colors.eggWhite}00`]}
        locations={[0, 1]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, height: 56, marginTop: topSpacing }}>
        <GlassIconButton icon={X} onPress={onClose ?? (() => router.back())} size="lg" />
        <View className="absolute left-0 right-0 items-center" pointerEvents="none">
          <Text className="h4" numberOfLines={1}>{title ?? ""}</Text>
          {sub ? <Text className="body-xs">{sub}</Text> : null}
        </View>
        {rightContent ?? <View className="w-12" />}
      </View>
    </Animated.View>
  );
}
