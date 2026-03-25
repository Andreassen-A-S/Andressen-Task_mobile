import { View, Text, Share, Alert, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";
import GlassPillButton from "@/components/userView/common/buttons/GlassPillButton";

interface Props {
  title?: string;
  path?: string;
}

export default function TaskDetailsHeader({ title, path }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 56;

  return (
    <View className="absolute left-0 right-0 top-0 z-10" style={{ height: headerHeight }}>
      {Platform.OS === "ios" ? (
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
      ) : (
        <LinearGradient
          colors={[colors.eggWhite, `${colors.eggWhite}00`]}
          locations={[0.6, 1]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
      )}

      {/* Nav row */}
      <View className="flex-row items-center justify-between px-4 h-14" style={{ marginTop: insets.top }}>
        {/* Back + Title */}
        <View className="flex-row items-center gap-3 flex-1">
          <GlassIconButton systemName="chevron.left" onPress={() => router.back()} variant="lg" />
          <View className="flex-1">
            <Text style={typography.h6} numberOfLines={1}>{title ?? ""}</Text>
            <Text style={typography.bodyXs} numberOfLines={1}>{path ?? "Andreassen-A-S"}</Text>
          </View>
        </View>

        {/* Share + More — single glass pill */}
        <GlassPillButton
          variant="lg"
          items={[
            { systemName: "square.and.arrow.up", onPress: async () => { if (title) await Share.share({ message: title }); } },
            { systemName: "ellipsis", onPress: () => Alert.alert("Mere", "Kommer snart") },
          ]}
        />
      </View>
    </View>
  );
}
