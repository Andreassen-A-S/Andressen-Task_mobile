import { ReactNode } from "react";
import { View, Text, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { ChevronLeft } from "lucide-react-native";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";

interface Props {
  title?: string;
  path?: string;
  rightContent?: ReactNode;
  modal?: boolean;
  bottomBorder?: boolean;
}

export function usePathHeaderHeight(modal = false): number {
  const insets = useSafeAreaInsets();
  const topSpacing = modal ? (Platform.OS === "ios" ? 12 : insets.top) : insets.top;
  return topSpacing + 56;
}

export default function PathHeader({ title, path, rightContent, modal = false, bottomBorder = false }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topSpacing = modal ? (Platform.OS === "ios" ? 12 : insets.top) : insets.top;
  const headerHeight = topSpacing + 56;

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        zIndex: 10,
        height: headerHeight,
        borderBottomWidth: bottomBorder ? 1 : 0,
        borderBottomColor: colors.border,
      }}
    >
      {Platform.OS === "ios" ? (
        <MaskedView
          className="absolute inset-0"
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
      ) : (
        <LinearGradient
          colors={[colors.eggWhite, `${colors.eggWhite}00`]}
          locations={[0.6, 1]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
      )}

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, height: 56, marginTop: topSpacing }} >
        <View className="flex-row items-center gap-3 flex-1">
          <GlassIconButton icon={ChevronLeft} onPress={() => router.back()} size="lg" />
          <View className="flex-1">
            <Text className="h6" numberOfLines={1}>{title ?? ""}</Text>
            {path ? <Text className="body-xs" numberOfLines={1}>{path}</Text> : null}
          </View>
        </View>
        {rightContent}
      </View>
    </View>
  );
}
