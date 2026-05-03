import { Platform } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";

interface Props {
  bottomInset: number;
  keyboardGap?: number;
}

export default function KeyboardSafeAreaSpacer({ bottomInset, keyboardGap = 0 }: Props) {
  const { progress } = useReanimatedKeyboardAnimation();

  const animatedStyle = useAnimatedStyle(() => ({
    height: Platform.OS === "android" || keyboardGap > 0
      ? bottomInset * (1 - progress.value) + keyboardGap * progress.value
      : bottomInset,
  }), [bottomInset, keyboardGap]);

  return <Animated.View style={animatedStyle} />;
}
