import { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";
import Reanimated, { useAnimatedStyle } from "react-native-reanimated";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";

export const COMPOSER_INPUT_OVERLAP = 135;
export const COMPOSER_ATTACHMENT_EXTRA_HEIGHT = 104;
export const COMPOSER_REPLY_EXTRA_HEIGHT = 64;

interface Props {
  children: ReactNode;
  hasAttachments?: boolean;
  hasReply?: boolean;
}

export default function ComposerChrome({ children, hasAttachments = false, hasReply = false }: Props) {
  const insets = useSafeAreaInsets();
  const { progress } = useReanimatedKeyboardAnimation();
  const composerHeight =
    COMPOSER_INPUT_OVERLAP +
    (hasAttachments ? COMPOSER_ATTACHMENT_EXTRA_HEIGHT : 0) +
    (hasReply ? COMPOSER_REPLY_EXTRA_HEIGHT : 0);
  const composerMarginStyle = useAnimatedStyle(() => ({ marginTop: -(composerHeight - progress.value * insets.bottom) }));
  const safeAreaStyle = useAnimatedStyle(() => ({ height: (1 - progress.value) * insets.bottom }));

  return (
    <Reanimated.View style={[{ zIndex: 1 }, composerMarginStyle]}>
      <MaskedView
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: composerHeight, zIndex: 0 }}
        pointerEvents="none"
        maskElement={
          <LinearGradient colors={["transparent", "black", "black"]} locations={[0, 0.7, 1]} style={{ flex: 1 }} />
        }
      >
        <BlurView intensity={7.5} tint="light" style={{ flex: 1 }} pointerEvents="none" />
      </MaskedView>
      <LinearGradient
        colors={[`${colors.eggWhite}00`, `${colors.eggWhite}CC`]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: composerHeight, zIndex: 0 }}
        pointerEvents="none"
      />
      {children}
      <Reanimated.View style={safeAreaStyle} />
    </Reanimated.View>
  );
}
