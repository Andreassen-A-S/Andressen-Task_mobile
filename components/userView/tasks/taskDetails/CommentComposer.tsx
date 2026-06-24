import { RefObject } from "react";
import { View, TextInput, NativeSyntheticEvent, TextInputSelectionChangeEventData } from "react-native";
import ComposerChrome, {
  COMPOSER_ATTACHMENT_EXTRA_HEIGHT,
  COMPOSER_INPUT_OVERLAP,
  COMPOSER_REPLY_EXTRA_HEIGHT,
} from "@/components/userView/common/ComposerChrome";
import ComposerSurface from "@/components/userView/common/ComposerSurface";
import KeyboardInputBar from "@/components/userView/common/KeyboardInputBar";
import ComposerButton from "@/components/userView/common/ComposerButton";
import PendingAttachmentStrip from "@/components/userView/common/PendingAttachmentStrip";
import { PendingAttachment } from "./TaskComments";
import { CommentReplyTarget } from "@/types/comment";
import CommentReplyBanner from "./CommentReplyBanner";

export const INPUT_BAR_OVERLAP = COMPOSER_INPUT_OVERLAP;
export const ATTACHMENT_LIST_EXTRA_HEIGHT = COMPOSER_ATTACHMENT_EXTRA_HEIGHT;
export const REPLY_PREVIEW_EXTRA_HEIGHT = COMPOSER_REPLY_EXTRA_HEIGHT;

interface Props {
  inputRef: RefObject<TextInput | null>;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  pendingAttachments: PendingAttachment[];
  replyingTo: CommentReplyTarget | null;
  onPickAttachments: () => void;
  onRemoveAttachment: (id: string) => void;
  onCancelReply: () => void;
  onSelectionChange?: (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => void;
  selection?: { start: number; end: number };
}

export default function CommentComposer({
  inputRef,
  value,
  onChangeText,
  onSubmit,
  canSubmit,
  isSubmitting,
  pendingAttachments,
  replyingTo,
  onPickAttachments,
  onRemoveAttachment,
  onCancelReply,
  onSelectionChange,
  selection,
}: Props) {
  const hasAttachments = pendingAttachments.length > 0;
  const hasReply = !!replyingTo;

  return (
    <ComposerChrome hasAttachments={hasAttachments} hasReply={hasReply}>
      <View className="px-3 pt-3 pb-1" style={{ zIndex: 2 }}>
        {replyingTo ? (
          <View className="mb-2">
            <CommentReplyBanner reply={replyingTo} onCancel={onCancelReply} />
          </View>
        ) : null}
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
            onSelectionChange={onSelectionChange}
            selection={selection}
          />
        </ComposerSurface>
      </View>
    </ComposerChrome>
  );
}
