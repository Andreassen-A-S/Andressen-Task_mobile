import { TaskAttachment } from "@/types/comment";

const urlCache = new Map<string, { url: string; expiresAt: number }>();
const TTL = 50 * 60 * 1000; // 50 min — GCS read URLs live 1 hour

export function applyAttachmentUrlCache(attachments: TaskAttachment[]): TaskAttachment[] {
  const now = Date.now();
  return attachments.map((a) => {
    const cached = urlCache.get(a.attachment_id);
    if (cached && cached.expiresAt > now) return { ...a, url: cached.url };
    urlCache.set(a.attachment_id, { url: a.url, expiresAt: now + TTL });
    return a;
  });
}

export function bustAttachmentUrl(attachmentId: string) {
  urlCache.delete(attachmentId);
}
