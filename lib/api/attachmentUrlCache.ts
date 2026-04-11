import { TaskAttachment } from "@/types/comment";

const urlCache = new Map<string, { url: string; expiresAt: number }>();
const TTL = 50 * 60 * 1000; // 50 min — GCS read URLs live 1 hour

const MAX_CACHE_SIZE = 500;

export function applyAttachmentUrlCache(attachments: TaskAttachment[]): TaskAttachment[] {
  const now = Date.now();

  const result = attachments.map((a) => {
    const cached = urlCache.get(a.attachment_id);
    if (cached && cached.expiresAt > now) return { ...a, url: cached.url };
    urlCache.set(a.attachment_id, { url: a.url, expiresAt: now + TTL });
    return a;
  });

  // Evict expired entries after inserts
  for (const [id, entry] of urlCache) {
    if (entry.expiresAt <= now) urlCache.delete(id);
  }

  // Evict oldest entries if still over limit
  if (urlCache.size > MAX_CACHE_SIZE) {
    const overflow = urlCache.size - MAX_CACHE_SIZE;
    let i = 0;
    for (const key of urlCache.keys()) {
      if (i++ >= overflow) break;
      urlCache.delete(key);
    }
  }

  return result;
}

export function bustAttachmentUrl(attachmentId: string) {
  urlCache.delete(attachmentId);
}
