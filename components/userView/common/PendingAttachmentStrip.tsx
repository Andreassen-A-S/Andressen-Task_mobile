import { useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";
import PendingAttachmentCard from "@/components/userView/common/PendingAttachmentCard";

export type PendingAttachmentPreview = {
  id: string;
  localUri: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  width?: number;
  height?: number;
};

interface Props {
  attachments: PendingAttachmentPreview[];
  onRemoveAttachment: (id: string) => void;
}

export default function PendingAttachmentStrip({ attachments, onRemoveAttachment }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    });
    return () => cancelAnimationFrame(frame);
  }, [attachments.length]);

  if (attachments.length === 0) return null;

  return (
    <View style={{ padding: 8, paddingBottom: 0 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        style={{ height: 96, flexGrow: 0 }}
        contentContainerStyle={{ minWidth: "100%" }}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {attachments.map((attachment, index) => (
          <View key={attachment.id} style={{ marginRight: index === attachments.length - 1 ? 0 : 8 }}>
            <PendingAttachmentCard
              uri={attachment.localUri}
              mimeType={attachment.mimeType}
              fileName={attachment.fileName}
              onRemove={() => onRemoveAttachment(attachment.id)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
