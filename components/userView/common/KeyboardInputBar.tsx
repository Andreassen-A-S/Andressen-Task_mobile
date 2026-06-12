import { ReactNode, RefObject, useRef } from "react";
import { View, TextInput, LayoutChangeEvent } from "react-native";
import { colors } from "@/constants/colors";
import ComposerButton from "./ComposerButton";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isSubmitting?: boolean;
  canSubmit?: boolean;
  leftActions?: ReactNode;
  surface?: "standalone" | "embedded";
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
  surface = "standalone",
  inputRef: externalInputRef,
  onLayout,
}: Props) {
  const internalRef = useRef<TextInput>(null);
  const inputRef = externalInputRef ?? internalRef;
  const embedded = surface === "embedded";

  return (
    <View className={embedded ? "" : "pt-3 px-3 pb-1"} onLayout={onLayout}>
      <View
        className={`${embedded ? "" : "bg-surface rounded-3xl border border-surface-subtle"} px-2 pt-[14] pb-2`}
      >
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
          <ComposerButton
            icon="arrow-up"
            onPress={onSubmit}
            disabled={!canSubmit}
            loading={isSubmitting}
            variant={canSubmit ? "primary" : "secondary"}
          />
        </View>
      </View>
    </View>
  );
}
