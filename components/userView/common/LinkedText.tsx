import { Linking, Text, type StyleProp, type TextProps, type TextStyle } from "react-native";

const HTTP_URL_PATTERN = /https?:\/\/[^\s]+/gi;
const TRAILING_PUNCTUATION = /[.,!?;:)\]}>"']+$/;
const TOKEN_SRC = String.raw`@\[([^\]]+)\]\(([^)]+)\)`;

interface LinkedTextProps extends Omit<TextProps, "children"> {
  text: string;
  style?: StyleProp<TextStyle>;
  linkStyle?: StyleProp<TextStyle>;
  mentionStyle?: StyleProp<TextStyle>;
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

type Segment = { type: "text"; value: string } | { type: "mention"; name: string };

function splitMentionTokens(text: string): Segment[] {
  const re = new RegExp(TOKEN_SRC, "g");
  const parts: Segment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: "text", value: text.slice(last, m.index) });
    parts.push({ type: "mention", name: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts.length > 0 ? parts : [{ type: "text", value: text }];
}

export default function LinkedText({ text, style, linkStyle, mentionStyle, ...props }: LinkedTextProps) {
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
        return splitMentionTokens(part.value).map((seg, segIdx) => {
          if (seg.type === "mention") {
            return (
              <Text key={`mention-${index}-${segIdx}`} style={[{ fontFamily: "Outfit_600SemiBold" }, mentionStyle]}>
                {`@${seg.name}`}
              </Text>
            );
          }
          return seg.value;
        });
      })}
    </Text>
  );
}
