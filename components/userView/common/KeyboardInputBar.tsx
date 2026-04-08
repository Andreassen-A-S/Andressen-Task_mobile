import { type ReactNode, useRef } from "react";
import { View, TextInput, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import KeyboardInputBarAction from "./KeyboardInputBarAction";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isSubmitting?: boolean;
  canSubmit?: boolean;
  leftActions?: ReactNode;
  attachments?: ReactNode;
  inputRef?: React.RefObject<TextInput | null>;
  onLayout?: (e: LayoutChangeEvent) => void;
}

export default function KeyboardInputBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Besked...",
  isSubmitting = false,
  canSubmit = false,
  leftActions,
  attachments,
  inputRef: externalInputRef,
  onLayout,
}: Props) {
  const insets = useSafeAreaInsets();
  const internalRef = useRef<TextInput>(null);
  const inputRef = externalInputRef ?? internalRef;

  const keyboardHeight = useSharedValue(0);

  useKeyboardHandler({
    onMove: (e) => { "worklet"; keyboardHeight.value = e.height; },
    onEnd: (e) => { "worklet"; keyboardHeight.value = e.height; },
    onInteractive: (e) => { "worklet"; keyboardHeight.value = e.height; },
  }, []);

  const spacerStyle = useAnimatedStyle(() => ({
    height: Math.max(keyboardHeight.value, insets.bottom),
  }));

  return (
    <>
      {/* Input card — onLayout measures card height only, independent of keyboard spacer */}
      <View style={{ paddingTop: 12, paddingHorizontal: 12, paddingBottom: 4 }} onLayout={onLayout}>
        <View style={{ backgroundColor: colors.white, borderRadius: 24, borderWidth: 1, borderColor: colors.muted, paddingHorizontal: 8, paddingTop: attachments ? 8 : 14, paddingBottom: 8, overflow: "hidden" }}>

          {/* Attachments slot */}
          {attachments}

          {/* Text input */}
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            multiline
            autoCorrect
            autoCapitalize="sentences"
            style={[typography.bodyMd, { maxHeight: 120, paddingVertical: 0, paddingHorizontal: 10 }]}
          />

          {/* Action row */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
            {leftActions}
            <View style={{ flex: 1 }} />
            <KeyboardInputBarAction
              icon="arrow-up"
              onPress={onSubmit}
              disabled={!canSubmit}
              loading={isSubmitting}
              backgroundColor={canSubmit ? colors.green : colors.muted}
              iconColor={canSubmit ? colors.white : colors.textMuted}
            />
          </View>
        </View>
      </View>

      {/* Keyboard spacer — handles keyboard avoidance only */}
      <Animated.View style={spacerStyle} />
    </>
  );
}
