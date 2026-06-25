const TOKEN_SRC = String.raw`@\[([^\]]+)\]\(([^)]+)\)`;
const BOUNDARY = /[\s.,!?;:)\]}>"']/;

export function buildTokenText(
    displayText: string,
    pendingMentions: { name: string; userId: string }[]
): string {
    const queues = new Map<string, string[]>();
    for (const m of pendingMentions) {
        if (!queues.has(m.name)) queues.set(m.name, []);
        queues.get(m.name)!.push(m.userId);
    }
    // longest name first to avoid partial matches (e.g. "Lars" before "Lars Jensen")
    const sorted = [...queues.entries()].sort((a, b) => b[0].length - a[0].length);
    // tracks last used userId per name so repeated mentions of the same user all tokenize
    const lastUsed = new Map<string, string>();

    let result = '';
    let i = 0;

    while (i < displayText.length) {
        const at = displayText.indexOf('@', i);
        if (at === -1) { result += displayText.slice(i); break; }
        result += displayText.slice(i, at);

        let matched = false;
        for (const [name, ids] of sorted) {
            const end = at + 1 + name.length;
            if (displayText.slice(at + 1, end) !== name) continue;
            const next = displayText[end] ?? '';
            if (next && !BOUNDARY.test(next)) continue;
            const userId = ids.shift() ?? lastUsed.get(name);
            if (!userId) continue;
            lastUsed.set(name, userId);
            result += `@[${name}](${userId})`;
            i = end;
            matched = true;
            break;
        }

        if (!matched) { result += '@'; i = at + 1; }
    }

    return result;
}

export function tokenToDisplayText(tokenText: string): string {
    return tokenText.replace(new RegExp(TOKEN_SRC, 'g'), '@$1');
}

export function extractMentionUserIds(tokenText: string): string[] {
    const ids: string[] = [];
    const re = new RegExp(TOKEN_SRC, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(tokenText)) !== null) {
        if (!ids.includes(m[2])) ids.push(m[2]);
    }
    return ids;
}

export function parseTokenMentions(tokenText: string): { name: string; userId: string }[] {
    const mentions: { name: string; userId: string }[] = [];
    const re = new RegExp(TOKEN_SRC, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(tokenText)) !== null) {
        mentions.push({ name: m[1], userId: m[2] });
    }
    return mentions;
}

export function prunePendingMentions(
    pendingMentions: { name: string; userId: string }[],
    displayText: string
): { name: string; userId: string }[] {
    if (pendingMentions.length === 0) return pendingMentions;

    // Count visible @Name occurrences using the same boundary rules as buildTokenText
    const names = [...new Set(pendingMentions.map(m => m.name))].sort((a, b) => b.length - a.length);
    const counts = new Map<string, number>();
    let i = 0;
    while (i < displayText.length) {
        const at = displayText.indexOf('@', i);
        if (at === -1) break;
        let matched = false;
        for (const name of names) {
            const end = at + 1 + name.length;
            if (displayText.slice(at + 1, end) !== name) continue;
            const next = displayText[end] ?? '';
            if (next && !BOUNDARY.test(next)) continue;
            counts.set(name, (counts.get(name) ?? 0) + 1);
            i = end;
            matched = true;
            break;
        }
        if (!matched) i = at + 1;
    }

    // Keep at most N entries per name where N = visible count
    const used = new Map<string, number>();
    return pendingMentions.filter(m => {
        const count = counts.get(m.name) ?? 0;
        const seen = used.get(m.name) ?? 0;
        if (seen >= count) return false;
        used.set(m.name, seen + 1);
        return true;
    });
}
