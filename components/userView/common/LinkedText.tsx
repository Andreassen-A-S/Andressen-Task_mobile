import { Linking, Text, type StyleProp, type TextProps, type TextStyle } from "react-native";

const HTTP_URL_PATTERN = /https?:\/\/[^\s]+/gi;
const TRAILING_PUNCTUATION = /[.,!?;:)\]}]+$/;

interface LinkedTextProps extends Omit<TextProps, "children"> {
  text: string;
  style?: StyleProp<TextStyle>;
  linkStyle?: StyleProp<TextStyle>;
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

export default function LinkedText({ text, style, linkStyle, ...props }: LinkedTextProps) {
  const parts: Array<{ type: "text" | "link"; value: string }> = [];
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
      {parts.map((part, index) =>
        part.type === "link" ? (
          <Text
            key={`${part.value}-${index}`}
            style={linkStyle}
            onPress={() => openLink(part.value)}
          >
            {part.value}
          </Text>
        ) : (
          part.value
        )
      )}
    </Text>
  );
}
