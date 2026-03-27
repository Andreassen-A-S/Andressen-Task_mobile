import { View, Text, Platform } from "react-native";
import { type ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { typography } from "@/constants/typography";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";
import { colors } from "@/constants/colors";
import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";

interface Props {
  title?: string;
  sub?: string;
  rightContent?: ReactNode;
}

export default function ModalHeader({ title, sub, rightContent }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topSpacing = Platform.OS === "ios" ? 12 : insets.top;
  const headerHeight = topSpacing + (sub ? 68 : 56);

  return (
    <View style={{ position: "absolute", left: 0, right: 0, top: 0, zIndex: 10, height: headerHeight }}>
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
        <GlassIconButton systemName="xmark" onPress={() => router.back()} variant="lg" />
        <View style={{ position: "absolute", left: 0, right: 0, alignItems: "center" }} pointerEvents="none">
          <Text style={typography.h4} numberOfLines={1}>{title ?? ""}</Text>
          {sub ? <Text style={typography.bodyXs}>{sub}</Text> : null}
        </View>
        {rightContent ?? <View style={{ width: 48 }} />}
      </View>
    </View>
  );
}
