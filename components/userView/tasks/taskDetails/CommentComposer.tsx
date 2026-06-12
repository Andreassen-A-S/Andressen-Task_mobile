import { RefObject } from "react";
import { View, TextInput } from "react-native";
import ComposerChrome, {
  COMPOSER_ATTACHMENT_EXTRA_HEIGHT,
  COMPOSER_INPUT_OVERLAP,
} from "@/components/userView/common/ComposerChrome";
import ComposerSurface from "@/components/userView/common/ComposerSurface";
import KeyboardInputBar from "@/components/userView/common/KeyboardInputBar";
import ComposerButton from "@/components/userView/common/ComposerButton";
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
        <ComposerSurface>
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
              <ComposerButton icon="add" onPress={onPickAttachments} disabled={isSubmitting} variant="secondary" />
            }
            surface="embedded"
          />
        </ComposerSurface>
      </View>
    </ComposerChrome>
  );
}
