import { ComponentType, Ref, forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { requireNativeViewManager } from "expo-modules-core";

const BASE_STYLE: ViewStyle = {
  minHeight: 24,
};

export type MentionRange = {
  start: number;
  end: number;
  name: string;
  userId: string;
};

export type MentionTextInputRef = {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  insertMention: (userId: string, name: string) => void;
  getPayload: () => Promise<{ text: string; mentions: MentionRange[] }> | { text: string; mentions: MentionRange[] };
};

type NativeEvent<T> = { nativeEvent: T };

type NativeRef = {
  focus?: () => Promise<void>;
  blur?: () => Promise<void>;
  clear?: () => Promise<void>;
  insertMention?: (userId: string, name: string) => Promise<void>;
  getPayload?: () => Promise<{ text: string; mentions: MentionRange[] }>;
};

type Props = {
  value: string;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  onChange: (text: string, mentions: MentionRange[]) => void;
  onMentionQueryChange?: (query: string | null) => void;
  onSelectionChange?: (selection: { start: number; end: number }) => void;
  onHeightChange?: (height: number) => void;
};

type NativeProps = {
  value?: string;
  placeholder: string;
  mentions: MentionRange[];
  style?: StyleProp<ViewStyle>;
  onComposerChange: (event: NativeEvent<{ text: string; mentions: MentionRange[] }>) => void;
  onMentionQueryChange: (event: NativeEvent<{ query?: string | null }>) => void;
  onSelectionChange: (event: NativeEvent<{ start: number; end: number }>) => void;
  onHeightChange: (event: NativeEvent<{ height: number }>) => void;
};

const NativeView = requireNativeViewManager<NativeProps>("NativeMentionComposer") as ComponentType<
  NativeProps & { ref?: Ref<NativeRef> }
>;

const NativeMentionComposer = forwardRef<MentionTextInputRef, Props>(function NativeMentionComposer(
  { value, placeholder = "Besked...", style, onChange, onMentionQueryChange, onSelectionChange, onHeightChange },
  ref,
) {
  const nativeRef = useRef<NativeRef>(null);
  const payloadRef = useRef<{ text: string; mentions: MentionRange[] }>({ text: value, mentions: [] });
  const [mentions, setMentions] = useState<MentionRange[]>([]);

  payloadRef.current.text = value;
  payloadRef.current.mentions = mentions;

  const handleChange = useCallback((event: NativeEvent<{ text: string; mentions: MentionRange[] }>) => {
    const nextMentions = event.nativeEvent.mentions ?? [];
    payloadRef.current = { text: event.nativeEvent.text, mentions: nextMentions };
    setMentions(nextMentions);
    onChange(event.nativeEvent.text, nextMentions);
  }, [onChange]);

  useImperativeHandle(ref, () => ({
    focus: () => { void nativeRef.current?.focus?.(); },
    blur: () => { void nativeRef.current?.blur?.(); },
    clear: () => {
      payloadRef.current = { text: "", mentions: [] };
      setMentions([]);
      void nativeRef.current?.clear?.();
    },
    insertMention: (userId: string, name: string) => {
      void nativeRef.current?.insertMention?.(userId, name);
    },
    getPayload: async () => {
      const nativePayload = await nativeRef.current?.getPayload?.();
      return nativePayload ?? payloadRef.current;
    },
  }), []);

  const nativeStyle = useMemo(() => [BASE_STYLE, style], [style]);

  return (
    <NativeView
      ref={nativeRef}
      placeholder={placeholder}
      mentions={mentions}
      style={nativeStyle}
      onComposerChange={handleChange}
      onMentionQueryChange={(event) => onMentionQueryChange?.(event.nativeEvent.query ?? null)}
      onSelectionChange={(event) => onSelectionChange?.({ start: event.nativeEvent.start, end: event.nativeEvent.end })}
      onHeightChange={(event) => onHeightChange?.(event.nativeEvent.height)}
    />
  );
});

export default NativeMentionComposer;
