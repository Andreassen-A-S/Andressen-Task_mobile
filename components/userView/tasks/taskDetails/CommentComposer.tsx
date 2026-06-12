import { RefObject } from "react";
import { View, TextInput } from "react-native";
import { colors } from "@/constants/colors";
import ComposerChrome, {
  COMPOSER_ATTACHMENT_EXTRA_HEIGHT,
  COMPOSER_INPUT_OVERLAP,
} from "@/components/userView/common/ComposerChrome";
import KeyboardInputBar from "@/components/userView/common/KeyboardInputBar";
import KeyboardInputBarAction from "@/components/userView/common/KeyboardInputBarAction";
import PendingAttachmentStrip from "@/components/userView/common/PendingAttachmentStrip";
import { PendingAttachment } from "./TaskComments";

export const INPUT_BAR_OVERLAP = COMPOSER_INPUT_OVERLAP;
export const ATTACHMENT_LIST_EXTRA_HEIGHT = COMPOSER_ATTACHMENT_EXTRA_HEIGHT;

interface Props {
  inputRef: RefObject<TextInput | null>;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  pendingAttachments: PendingAttachment[];
  onPickAttachments: () => void;
  onRemoveAttachment: (id: string) => void;
}

export default function CommentComposer({
  inputRef,
  value,
  onChangeText,
  onSubmit,
  canSubmit,
  isSubmitting,
  pendingAttachments,
  onPickAttachments,
  onRemoveAttachment,
}: Props) {
  const hasAttachments = pendingAttachments.length > 0;

  return (
    <ComposerChrome hasAttachments={hasAttachments}>
      <View className="px-3 pt-3 pb-1" style={{ zIndex: 2 }}>
        <View
          className="bg-surface rounded-3xl border border-surface-subtle"
          style={{ backgroundColor: colors.surface, borderRadius: 24, elevation: 2 }}
        >
          <PendingAttachmentStrip
            attachments={pendingAttachments}
            onRemoveAttachment={onRemoveAttachment}
          />
          <KeyboardInputBar
            inputRef={inputRef}
            value={value}
            onChangeText={onChangeText}
            onSubmit={onSubmit}
            canSubmit={canSubmit}
            isSubmitting={isSubmitting}
            leftActions={
              <KeyboardInputBarAction icon="add" onPress={onPickAttachments} iconSize={26} disabled={isSubmitting} />
            }
            surface="embedded"
          />
        </View>
      </View>
    </ComposerChrome>
  );
}
