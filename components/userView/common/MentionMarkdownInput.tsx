import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  NativeSyntheticEvent,
  StyleProp,
  TextInput,
  TextInputContentSizeChangeEventData,
  TextInputSelectionChangeEventData,
  TextStyle,
} from "react-native";
import { colors } from "@/constants/colors";

const MarkdownTextInput = require("@expensify/react-native-live-markdown/lib/commonjs/MarkdownTextInput").default;

type LiveMarkdownRange = {
  type: "mention-user";
  start: number;
  length: number;
};

type MarkdownStyle = {
  mentionUser: {
    color: string;
    backgroundColor: string;
  };
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
  getPayload: () => { text: string; mentions: MentionRange[] };
};

type Selection = { start: number; end: number };

type Props = {
  value: string;
  placeholder?: string;
  editable?: boolean;
  style?: StyleProp<TextStyle>;
  onChange: (text: string, mentions: MentionRange[]) => void;
  onMentionQueryChange?: (query: string | null) => void;
  onSelectionChange?: (selection: Selection) => void;
};

const BASE_INPUT_STYLE: TextStyle = {
  alignSelf: "stretch",
  width: "100%",
  maxHeight: 120,
  paddingHorizontal: 10,
  paddingVertical: 0,
  fontFamily: "Outfit_400Regular",
  fontSize: 16,
  lineHeight: 24,
  color: colors.textPrimary,
};

const MARKDOWN_STYLE: MarkdownStyle = {
  mentionUser: {
    color: colors.green,
    backgroundColor: "transparent",
  },
};

const WORD_BREAK = /[\s.,!?;:()[\]{}"'<>]/;
const MIN_INPUT_HEIGHT = 24;
const MAX_INPUT_HEIGHT = 120;
const LINE_HEIGHT = 24;

function clampHeight(height: number): number {
  return Math.min(MAX_INPUT_HEIGHT, Math.max(MIN_INPUT_HEIGHT, Math.ceil(height)));
}

function estimateTextHeight(text: string): number {
  return clampHeight(Math.max(1, text.split("\n").length) * LINE_HEIGHT);
}

function getMentionQuery(text: string, cursor: number): string | null {
  if (cursor < 1) return null;

  let start = cursor - 1;
  while (start >= 0 && !WORD_BREAK.test(text[start])) {
    start -= 1;
  }

  const wordStart = start + 1;
  if (text[wordStart] !== "@") return null;

  return text.slice(wordStart + 1, cursor);
}

function findMentionReplacementRange(text: string, selection: Selection): Selection {
  if (selection.start !== selection.end) return selection;

  let start = selection.start - 1;
  while (start >= 0 && !WORD_BREAK.test(text[start])) {
    start -= 1;
  }

  const wordStart = start + 1;
  if (text[wordStart] !== "@") return selection;

  return { start: wordStart, end: selection.start };
}

function adjustMentionRanges(previousText: string, nextText: string, ranges: MentionRange[]): MentionRange[] {
  if (ranges.length === 0 || previousText === nextText) return ranges;

  let prefix = 0;
  const minLength = Math.min(previousText.length, nextText.length);
  while (prefix < minLength && previousText[prefix] === nextText[prefix]) {
    prefix += 1;
  }

  let suffix = 0;
  while (
    suffix < previousText.length - prefix &&
    suffix < nextText.length - prefix &&
    previousText[previousText.length - 1 - suffix] === nextText[nextText.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const previousEnd = previousText.length - suffix;
  const nextEnd = nextText.length - suffix;
  const delta = nextEnd - previousEnd;

  return ranges.flatMap((range) => {
    if (previousEnd <= range.start) {
      return [{ ...range, start: range.start + delta, end: range.end + delta }];
    }

    if (prefix >= range.end) {
      return [range];
    }

    return [];
  });
}

function normalizeMentions(text: string, ranges: MentionRange[]): MentionRange[] {
  return ranges.filter((range) => text.slice(range.start, range.end) === `@${range.name}`);
}

const MentionMarkdownInput = forwardRef<MentionTextInputRef, Props>(function MentionMarkdownInput(
  {
    value,
    placeholder = "Besked...",
    editable = true,
    style,
    onChange,
    onMentionQueryChange,
    onSelectionChange,
  },
  ref,
) {
  const inputRef = useRef<TextInput>(null);
  const valueRef = useRef(value);
  const mentionsRef = useRef<MentionRange[]>([]);
  const selectionRef = useRef<Selection>({ start: value.length, end: value.length });
  const [mentions, setMentions] = useState<MentionRange[]>([]);
  const [selection, setSelection] = useState<Selection>({ start: value.length, end: value.length });
  const [inputHeight, setInputHeight] = useState(() => estimateTextHeight(value));

  valueRef.current = value;
  mentionsRef.current = mentions;

  useEffect(() => {
    if (value.length === 0) {
      setInputHeight(MIN_INPUT_HEIGHT);
    }
  }, [value]);

  const parserMentions = useMemo(
    () => mentions.map((mention) => ({
      start: mention.start,
      length: mention.end - mention.start,
      name: mention.name,
    })),
    [mentions],
  );

  const parser = useMemo(() => {
    return function parseValidMentions(input: string): LiveMarkdownRange[] {
      "worklet";

      const ranges: LiveMarkdownRange[] = [];
      for (const mention of parserMentions) {
        if (mention.length <= 1) continue;
        if (input.slice(mention.start, mention.start + mention.length) !== `@${mention.name}`) continue;
        ranges.push({ start: mention.start, length: mention.length, type: "mention-user" });
      }
      return ranges;
    };
  }, [parserMentions]);

  const commitChange = useCallback((nextText: string, nextMentions: MentionRange[]) => {
    const normalizedMentions = normalizeMentions(nextText, nextMentions);
    setMentions(normalizedMentions);
    mentionsRef.current = normalizedMentions;
    valueRef.current = nextText;
    onChange(nextText, normalizedMentions);
  }, [onChange]);

  const updateMentionQuery = useCallback((text: string, nextSelection: Selection) => {
    if (!onMentionQueryChange) return;
    if (nextSelection.start !== nextSelection.end) {
      onMentionQueryChange(null);
      return;
    }

    onMentionQueryChange(getMentionQuery(text, nextSelection.start));
  }, [onMentionQueryChange]);

  const handleChangeText = useCallback((nextText: string) => {
    const nextMentions = adjustMentionRanges(valueRef.current, nextText, mentionsRef.current);
    setInputHeight(estimateTextHeight(nextText));
    commitChange(nextText, nextMentions);
    updateMentionQuery(nextText, selectionRef.current);
  }, [commitChange, updateMentionQuery]);

  const handleSelectionChange = useCallback((event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    const nextSelection = event.nativeEvent.selection;
    selectionRef.current = nextSelection;
    setSelection(nextSelection);
    onSelectionChange?.(nextSelection);
    updateMentionQuery(valueRef.current, nextSelection);
  }, [onSelectionChange, updateMentionQuery]);

  const handleContentSizeChange = useCallback((event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
    setInputHeight(clampHeight(event.nativeEvent.contentSize.height));
  }, []);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => {
      const emptySelection = { start: 0, end: 0 };
      selectionRef.current = emptySelection;
      setSelection(emptySelection);
      commitChange("", []);
      onMentionQueryChange?.(null);
    },
    insertMention: (userId: string, name: string) => {
      const currentText = valueRef.current;
      const replacement = findMentionReplacementRange(currentText, selectionRef.current);
      const mentionText = `@${name}`;
      const needsSpace = currentText[replacement.end] !== " " && currentText[replacement.end] !== "\n";
      const insertedText = needsSpace ? `${mentionText} ` : mentionText;
      const nextText = `${currentText.slice(0, replacement.start)}${insertedText}${currentText.slice(replacement.end)}`;
      const insertedMention = {
        start: replacement.start,
        end: replacement.start + mentionText.length,
        name,
        userId,
      };
      const nextMentions = adjustMentionRanges(currentText, nextText, mentionsRef.current)
        .filter((mention) => mention.end <= replacement.start || mention.start >= replacement.end);
      const nextSelection = { start: replacement.start + insertedText.length, end: replacement.start + insertedText.length };

      selectionRef.current = nextSelection;
      setSelection(nextSelection);
      commitChange(nextText, [...nextMentions, insertedMention].sort((a, b) => a.start - b.start));
      onMentionQueryChange?.(null);

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
    getPayload: () => ({
      text: valueRef.current,
      mentions: normalizeMentions(valueRef.current, mentionsRef.current),
    }),
  }), [commitChange, onMentionQueryChange]);

  return (
    <MarkdownTextInput
      ref={inputRef}
      value={value}
      editable={editable}
      parser={parser}
      markdownStyle={MARKDOWN_STYLE}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      multiline
      autoCorrect
      autoCapitalize="sentences"
      scrollEnabled={false}
      selection={selection}
      style={[BASE_INPUT_STYLE, { height: inputHeight }, style]}
      onChangeText={handleChangeText}
      onSelectionChange={handleSelectionChange}
      onContentSizeChange={handleContentSizeChange}
    />
  );
});

export default MentionMarkdownInput;
