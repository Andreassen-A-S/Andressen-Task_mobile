import { useEffect, useRef, useState } from "react";
import { View, Text, Image, TouchableOpacity, Pressable, Animated, Dimensions, Easing } from "react-native";
import { BlurView } from "expo-blur";
import { Trash2, Copy, Download } from "lucide-react-native";
import { colors } from "@/constants/colors";

const SCREEN_H = Dimensions.get("window").height;
const SCREEN_W = Dimensions.get("window").width;
const ACTION_H = 52;

export interface BubbleLayout {
  pageX: number;
  pageY: number;
  width: number;
  height: number;
}

export interface MenuParams {
  layout: BubbleLayout;
  snapshotLayout?: BubbleLayout;
  attachmentsLayout?: BubbleLayout;
  attachmentsSnapshot?: string;
  message?: string;
  isOwn: boolean;
  canDelete: boolean;
  canCopy: boolean;
  canSave: boolean;
  onDelete: () => void;
  onCopy: () => void;
  onSave: () => void;
}

interface Props {
  visible: boolean;
  params: MenuParams | null;
  onClose: () => void;
  onDismissed?: () => void;
  minTop?: number;
}

export default function CommentContextMenu({ visible, params, onClose, onDismissed, minTop = 16 }: Props) {
  // anim: spring — drives scale and opacity
  const anim = useRef(new Animated.Value(0)).current;
  // moveAnim: eased timing — drives translateX/Y so translations don't spring-overshoot
  const moveAnim = useRef(new Animated.Value(0)).current;
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowing(true);
      anim.setValue(0);
      moveAnim.setValue(0);
      Animated.parallel([
        Animated.spring(anim, { toValue: 1, bounciness: 5, speed: 14, useNativeDriver: true }),
        Animated.timing(moveAnim, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(anim, { toValue: 0, duration: 130, useNativeDriver: true }),
        Animated.timing(moveAnim, { toValue: 0, duration: 130, useNativeDriver: true }),
      ]).start(() => { setShowing(false); onDismissed?.(); });
    }
  }, [visible]);

  if (!showing || !params) return null;

  const { layout, snapshotLayout, message, isOwn, canDelete, canCopy, canSave, onDelete, onCopy, onSave } = params;
  const snap = snapshotLayout ?? layout;

  const actions = [
    ...(canSave ? [{ label: "Gem", icon: <Download size={18} color={colors.textPrimary} strokeWidth={2} />, onPress: () => { onSave(); onClose(); }, destructive: false }] : []),
    ...(canCopy ? [{ label: "Kopiér", icon: <Copy size={18} color={colors.textPrimary} strokeWidth={2} />, onPress: () => { onCopy(); onClose(); }, destructive: false }] : []),
    ...(canDelete ? [{ label: "Slet", icon: <Trash2 size={18} color={colors.red} strokeWidth={2} />, onPress: () => { onDelete(); onClose(); }, destructive: true }] : []),
  ];

  const actionListH = actions.length * ACTION_H;
  const PADDING = 16;
  const groupHeight = layout.height + 8 + actionListH;
  const groupTop = Math.max(minTop, Math.min(layout.pageY, SCREEN_H - PADDING - groupHeight));
  const verticalShift = groupTop - layout.pageY;
  const actionTop = layout.pageY + layout.height + 8 + verticalShift;

  return (
    <View
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}
      pointerEvents={visible ? "auto" : "none"}
    >
      {/* Static blur + dark tint faded via native-driver opacity — eliminates JS-thread animation */}
      <Animated.View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: anim }}>
        <BlurView intensity={60} tint="light" style={{ flex: 1 }} />
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)" }} />
      </Animated.View>

      {/* Tap backdrop to close */}
      <Pressable
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        onPress={onClose}
      />

      {/* Attachment snapshot — static bitmap captured via captureRef, no re-render or onLoad */}
      {params.attachmentsSnapshot && params.attachmentsLayout && (() => {
        const attLayout = params.attachmentsLayout;
        const attTargetLeft = isOwn ? SCREEN_W - 16 - attLayout.width : 16;
        return (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: attLayout.pageY,
              left: attTargetLeft,
              transform: [
                { translateX: moveAnim.interpolate({ inputRange: [0, 1], outputRange: [attLayout.pageX - attTargetLeft, 0] }) },
                { translateY: moveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, verticalShift] }) },
              ],
            }}
          >
            <Image
              source={{ uri: params.attachmentsSnapshot }}
              style={{ width: attLayout.width, height: attLayout.height }}
            />
          </Animated.View>
        );
      })()}

      {/* Bubble snapshot — full opacity from frame 0 so it covers the original immediately */}
      {message ? (() => {
        const bubbleTargetLeft = isOwn ? SCREEN_W - 16 - snap.width : 16;
        return (
          <Animated.View
            style={{
              position: "absolute",
              top: snap.pageY,
              left: bubbleTargetLeft,
              width: snap.width,
              transform: [
                { translateX: moveAnim.interpolate({ inputRange: [0, 1], outputRange: [snap.pageX - bubbleTargetLeft, 0] }) },
                { translateY: moveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, verticalShift] }) },
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
        );
      })() : null}

      {/* Action list */}
      {actions.length > 0 && (
        <Animated.View
          shouldRasterizeIOS
          renderToHardwareTextureAndroid
          style={{
            position: "absolute",
            top: actionTop,
            ...(isOwn ? { right: 16 } : { left: 16 }),
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
            {actions.map((action, i) => (
              <View key={action.label}>
                {i > 0 && <View style={{ height: 0.5, backgroundColor: "rgba(0,0,0,0.1)" }} />}
                <TouchableOpacity
                  onPress={action.onPress}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between px-4"
                  style={{ height: ACTION_H }}
                >
                  <Text className="body-md" style={{ color: action.destructive ? colors.red : colors.textPrimary }}>
                    {action.label}
                  </Text>
                  {action.icon}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}
