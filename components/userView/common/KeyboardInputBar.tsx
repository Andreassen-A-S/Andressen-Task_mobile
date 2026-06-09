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
            className="body-md"
            style={{ maxHeight: 120, paddingVertical: 0, paddingHorizontal: 10 }}
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

    </>
  );
}
