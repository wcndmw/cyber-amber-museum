import { ALLOWED_TYPES } from "./utils";

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "不支持的文件类型，仅支持 JPG/PNG/WebP/GIF/MP4/WebM" };
  }
  if (file.size > 50 * 1024 * 1024) {
    return { valid: false, error: "文件大小不能超过 50MB" };
  }
  return { valid: true };
}
