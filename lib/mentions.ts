const TOKEN_SRC = String.raw`@\[([^\]]+)\]\(([^)]+)\)`;

export function tokenToDisplayText(tokenText: string): string {
  return tokenText.replace(new RegExp(TOKEN_SRC, "g"), "@$1");
}

export function extractMentionUserIds(tokenText: string): string[] {
  const ids: string[] = [];
  const re = new RegExp(TOKEN_SRC, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(tokenText)) !== null) {
    if (!ids.includes(m[2])) ids.push(m[2]);
  }
  return ids;
}

export function buildTokenTextFromRanges(
  text: string,
  ranges: { start: number; end: number; name: string; userId: string }[]
): string {
  if (ranges.length === 0) return text;
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  let result = "";
  let i = 0;
  for (const range of sorted) {
    result += text.slice(i, range.start);
    result += `@[${range.name}](${range.userId})`;
    i = range.end;
  }
  result += text.slice(i);
  return result;
}
