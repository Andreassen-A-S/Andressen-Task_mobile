import { Linking, Text, type StyleProp, type TextProps, type TextStyle } from "react-native";

const HTTP_URL_PATTERN = /https?:\/\/[^\s]+/gi;
const TRAILING_PUNCTUATION = /[.,!?;:)\]}>"']+$/;
const MENTION_BOUNDARY = /[\s.,!?;:)\]}>"']/;

interface LinkedTextProps extends Omit<TextProps, "children"> {
  text: string;
  style?: StyleProp<TextStyle>;
  linkStyle?: StyleProp<TextStyle>;
  mentionStyle?: StyleProp<TextStyle>;
  mentionNames?: string[];
}

async function openLink(url: string) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  } catch {
    // Link opening should not interrupt comment rendering.
  }
}

function splitTrailingPunctuation(value: string) {
  const punctuation = value.match(TRAILING_PUNCTUATION)?.[0] ?? "";
  return {
    link: punctuation ? value.slice(0, -punctuation.length) : value,
    punctuation,
  };
}

function splitPlainMentions(value: string, mentionNames: string[]) {
  const names = [...new Set(mentionNames.filter(Boolean))].sort((a, b) => b.length - a.length);
  if (names.length === 0) return [{ type: "text" as const, value }];

  const parts: { type: "text" | "mention"; value: string }[] = [];
  let index = 0;

  while (index < value.length) {
    const at = value.indexOf("@", index);
    if (at === -1) break;

    const previous = at === 0 ? "" : value[at - 1];
    if (previous && !MENTION_BOUNDARY.test(previous)) {
      index = at + 1;
      continue;
    }

    const match = names.find((name) => {
      if (value.slice(at + 1, at + 1 + name.length) !== name) return false;
      const next = value[at + 1 + name.length] ?? "";
      return !next || MENTION_BOUNDARY.test(next);
    });

    if (!match) {
      index = at + 1;
      continue;
    }

    if (at > index) parts.push({ type: "text", value: value.slice(index, at) });
    parts.push({ type: "mention", value: `@${match}` });
    index = at + 1 + match.length;
  }

  if (index < value.length) parts.push({ type: "text", value: value.slice(index) });
  return parts.length > 0 ? parts : [{ type: "text" as const, value }];
}

export default function LinkedText({ text, style, linkStyle, mentionStyle, mentionNames = [], ...props }: LinkedTextProps) {
  const parts: { type: "text" | "link"; value: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  HTTP_URL_PATTERN.lastIndex = 0;
  while ((match = HTTP_URL_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    const { link, punctuation } = splitTrailingPunctuation(match[0]);
    if (link) parts.push({ type: "link", value: link });
    if (punctuation) parts.push({ type: "text", value: punctuation });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  if (parts.length === 0) {
    return <Text style={style} {...props}>{text}</Text>;
  }

  return (
    <Text style={style} {...props}>
      {parts.map((part, index) => {
        if (part.type === "link") {
          return (
            <Text key={`${part.value}-${index}`} style={linkStyle} onPress={() => openLink(part.value)}>
              {part.value}
            </Text>
          );
        }
        return splitPlainMentions(part.value, mentionNames).map((textPart, textIndex) => {
          if (textPart.type === "mention") {
            return (
              <Text key={`${textPart.value}-${index}-${textIndex}`} style={[{ fontFamily: "Outfit_600SemiBold" }, mentionStyle]}>
                {textPart.value}
              </Text>
            );
          }
          return textPart.value;
        });
      })}
    </Text>
  );
}
