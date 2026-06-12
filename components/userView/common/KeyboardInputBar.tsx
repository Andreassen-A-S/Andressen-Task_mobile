import { ReactNode, RefObject, useRef } from "react";
import { View, TextInput, LayoutChangeEvent } from "react-native";
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
  inputRef?: RefObject<TextInput | null>;
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
  const internalRef = useRef<TextInput>(null);
  const inputRef = externalInputRef ?? internalRef;

  return (
    <>
      <View className="pt-3 px-3 pb-1" onLayout={onLayout}>
        <View className={`bg-surface rounded-3xl border border-surface-subtle px-2 ${attachments ? "pt-2" : "pt-[14]"} pb-2`}>

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
            className="body-md max-h-[120] py-0 px-2.5"
          />

          {/* Action row */}
          <View className="flex-row items-center mt-3">
            {leftActions}
            <View className="flex-1" />
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

    </>
  );
}
