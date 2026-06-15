import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Pressable, Animated, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import { Trash2 } from "lucide-react-native";
import { colors } from "@/constants/colors";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const SCREEN_H = Dimensions.get("window").height;
const ACTION_H = 52;

export interface BubbleLayout {
  pageX: number;
  pageY: number;
  width: number;
  height: number;
}

export interface MenuParams {
  layout: BubbleLayout;
  message?: string;
  isOwn: boolean;
  canDelete: boolean;
  onDelete: () => void;
}

interface Props {
  visible: boolean;
  params: MenuParams | null;
  onClose: () => void;
}

export default function CommentContextMenu({ visible, params, onClose }: Props) {
  // anim: native driver — drives content scale / translateY
  const anim = useRef(new Animated.Value(0)).current;
  // blurAnim: JS driver — drives blur intensity (UIVisualEffectView can't use native opacity)
  const blurAnim = useRef(new Animated.Value(0)).current;
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowing(true);
      anim.setValue(0);
      blurAnim.setValue(0);
      Animated.parallel([
        Animated.spring(anim, { toValue: 1, bounciness: 5, speed: 14, useNativeDriver: true }),
        Animated.timing(blurAnim, { toValue: 1, duration: 220, useNativeDriver: false }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(anim, { toValue: 0, duration: 130, useNativeDriver: true }),
        Animated.timing(blurAnim, { toValue: 0, duration: 130, useNativeDriver: false }),
      ]).start(() => setShowing(false));
    }
  }, [visible]);

  if (!showing || !params) return null;

  const { layout, message, isOwn, canDelete, onDelete } = params;

  const actionBelow = layout.pageY + layout.height + 8 + ACTION_H < SCREEN_H - 60;
  const actionTop = actionBelow
    ? layout.pageY + layout.height + 8
    : layout.pageY - ACTION_H - 8;

  return (
    <View
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}
      pointerEvents={visible ? "auto" : "none"}
    >
      {/* Blur eases in via animated intensity — avoids UIVisualEffectView opacity flicker */}
      <AnimatedBlurView
        intensity={blurAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 60] })}
        tint="light"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Tap backdrop to close */}
      <Pressable
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        onPress={onClose}
      />

      {/* Bubble snapshot — full opacity from frame 0 so it covers the original immediately */}
      {message ? (
        <Animated.View
          style={{
            position: "absolute",
            top: layout.pageY,
            left: layout.pageX,
            width: layout.width,
            transform: [
              { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1.0, 1.05] }) },
            ],
          }}
        >
          <Pressable
            onPress={onClose}
            className={`rounded-2xl px-3 py-2 ${isOwn ? "self-end bg-accent" : "self-start bg-surface"}`}
          >
            <Text className={isOwn ? "body-md !text-white" : "body-md !text-secondary"}>
              {message}
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}

      {/* Action list */}
      {canDelete && (
        <Animated.View
          style={{
            position: "absolute",
            top: actionTop,
            ...(isOwn ? { right: 16 } : { left: 48 }),
            width: 260,
            borderRadius: 14,
            overflow: "hidden",
            opacity: anim,
            transform: [
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
            ],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
          }}
        >
          <View className="bg-white/90">
            <TouchableOpacity
              onPress={() => { onDelete(); onClose(); }}
              activeOpacity={0.7}
              className="flex-row items-center justify-between px-4"
              style={{ height: ACTION_H }}
            >
              <Text className="body-md" style={{ color: colors.red }}>Slet</Text>
              <Trash2 size={18} color={colors.red} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
