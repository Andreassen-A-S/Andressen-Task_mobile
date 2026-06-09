import { File, FileImage, FileSpreadsheet, FileText, type LucideIcon } from "lucide-react-native";

export function getFileIconComponent(mimeType?: string | null): LucideIcon {
  if (!mimeType) return File;
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType === "application/pdf") return FileText;
  if (mimeType.includes("word") || mimeType.includes("document")) return FileText;
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return FileSpreadsheet;
  return File;
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
