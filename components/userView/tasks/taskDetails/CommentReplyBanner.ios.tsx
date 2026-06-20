import { StyleSheet, View } from "react-native";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import { CommentReplyTarget } from "@/types/comment";
import CommentReplyPreview from "./CommentReplyPreview";

interface Props {
  reply: CommentReplyTarget;
  onCancel: () => void;
}

const canUseGlass = isGlassEffectAPIAvailable();

export default function CommentReplyBanner({ reply, onCancel }: Props) {
  return (
    <View style={styles.container}>
      {canUseGlass ? (
        <GlassView
          pointerEvents="none"
          glassEffectStyle="regular"
          tintColor="rgba(255,255,255,0.18)"
          style={styles.background}
        />
      ) : (
        <View pointerEvents="none" style={[styles.background, styles.fallback]} />
      )}
      <View style={styles.content}>
        <CommentReplyPreview
          authorName={reply.authorName}
          isOwn={reply.isOwn}
          preview={reply.preview}
          attachmentUrl={reply.attachmentUrl}
          attachmentWidth={reply.attachmentWidth}
          attachmentHeight={reply.attachmentHeight}
          variant="composer"
          onCancel={onCancel}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  background: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.62)",
  },
  fallback: {
    backgroundColor: "rgba(255,255,255,0.78)",
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
