import { useMemo } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from "react-native-reanimated";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

const TRACK_HEIGHT = 60;
const HANDLE_SIZE = 60;
const THRESHOLD = 0.82;

interface Props {
  onComplete: () => void;
  isCompleted?: boolean;
  isUpdating?: boolean;
}

export default function SlideToComplete({ onComplete, isCompleted = false, isUpdating = false }: Props) {
  const trackWidth = useSharedValue(0);
  const translateX = useSharedValue(0);
  const maxSlide = useDerivedValue(() => Math.max(1, trackWidth.value - HANDLE_SIZE));

  const trackBg = isCompleted ? colors.textMuted : colors.green;

  const pan = useMemo(() => Gesture.Pan()
    .activeOffsetX(8)
    .enabled(!isUpdating)
    .onUpdate(({ translationX }) => {
      translateX.value = Math.max(0, Math.min(translationX, maxSlide.value));
    })
    .onEnd(({ translationX }) => {
      if (translationX / maxSlide.value >= THRESHOLD) {
        translateX.value = withSpring(maxSlide.value, { overshootClamping: true }, () => runOnJS(onComplete)());
      } else {
        translateX.value = withSpring(0, { damping: 15, overshootClamping: true });
      }
    }), [isUpdating, onComplete]);

  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, maxSlide.value * 0.4], [1, 0], "clamp"),
  }));

  const fillStyle = useAnimatedStyle(() => ({
    left: translateX.value + HANDLE_SIZE / 2,
  }));

  return (
    <View
      style={{ height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT / 2, backgroundColor: colors.eggWhite, overflow: "hidden", maxWidth: 300, alignSelf: "center", width: "100%" }}
      onLayout={(e) => { trackWidth.value = e.nativeEvent.layout.width; }}
    >
      <Animated.View
        style={[fillStyle, { position: "absolute", right: 0, top: 0, bottom: 0, backgroundColor: trackBg }]}
        pointerEvents="none"
      />

      <Animated.Text
        style={[typography.btnLg, labelStyle, {
          position: "absolute",
          alignSelf: "center",
          top: (TRACK_HEIGHT - 20) / 2,
          color: colors.white,
        }]}
      >
        {isCompleted ? "Genåben" : "Færdiggør"}
      </Animated.Text>

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[handleStyle, {
            position: "absolute",
            top: 0,
            left: 0,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            borderRadius: HANDLE_SIZE / 2,
            backgroundColor: colors.white,
            borderWidth: 3,
            borderColor: trackBg,
            alignItems: "center",
            justifyContent: "center",
          }]}
        >
          <Ionicons
            name={isCompleted ? "refresh" : "chevron-forward"}
            size={26}
            color={trackBg}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
