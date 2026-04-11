export function getFileIcon(mimeType?: string | null): string {
  if (!mimeType) return "document-outline";
  if (mimeType === "application/pdf") return "document-text-outline";
  if (mimeType.includes("word") || mimeType.includes("document")) return "document-outline";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "grid-outline";
  return "document-outline";
}

// Mirror of BE storageService ALLOWED_MIME_TYPES maxBytes
export const MAX_FILE_SIZE: Record<string, number> = {
  "image/jpeg": 10 * 1024 * 1024,
  "image/png": 10 * 1024 * 1024,
  "image/webp": 10 * 1024 * 1024,
  "image/heic": 10 * 1024 * 1024,
  "application/pdf": 50 * 1024 * 1024,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 50 * 1024 * 1024,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": 50 * 1024 * 1024,
};
