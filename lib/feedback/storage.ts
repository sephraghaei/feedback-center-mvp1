import { MAX_FILE_BYTES } from "./constants";
import { MEDIA_BUCKET, mediaUrl } from "./media";

const BUCKET = MEDIA_BUCKET;

export const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

type StorageConfig = { url: string; key: string };

function config(): StorageConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return { url, key };
}

export function storageConfigured(): boolean {
  return config() !== null;
}

export function publicUrl(path: string): string {
  return mediaUrl(path);
}

export function isValidUpload(file: { type: string; size: number }): string | null {
  if (!ALLOWED_TYPES[file.type]) return "فقط تصویر (PNG، JPG، WebP، GIF) یا PDF مجاز است.";
  if (file.size > MAX_FILE_BYTES) return "حجم هر فایل باید کمتر از ۱۰ مگابایت باشد.";
  if (file.size === 0) return "فایل خالی است.";
  return null;
}

export function extensionFor(type: string): string {
  return ALLOWED_TYPES[type] ?? "bin";
}

const globalForStorage = globalThis as typeof globalThis & {
  __feedbackStorageBucket?: Promise<void>;
};

function headers(cfg: StorageConfig): Record<string, string> {
  return {
    Authorization: `Bearer ${cfg.key}`,
    apikey: cfg.key,
  };
}

async function createBucket(cfg: StorageConfig): Promise<void> {
  const response = await fetch(`${cfg.url}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...headers(cfg), "content-type": "application/json" },
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
      file_size_limit: MAX_FILE_BYTES,
      allowed_mime_types: Object.keys(ALLOWED_TYPES),
    }),
  });

  if (response.ok) return;
  const text = await response.text();
  if (response.status === 400 && /already exists|duplicate/i.test(text)) return;
  throw new Error(`bucket_create_failed:${response.status}`);
}

export async function ensureBucket(): Promise<StorageConfig> {
  const cfg = config();
  if (!cfg) throw new Error("storage_not_configured");

  if (!globalForStorage.__feedbackStorageBucket) {
    globalForStorage.__feedbackStorageBucket = createBucket(cfg).catch((error) => {
      globalForStorage.__feedbackStorageBucket = undefined;
      throw error;
    });
  }

  await globalForStorage.__feedbackStorageBucket;
  return cfg;
}

export async function uploadObject(
  path: string,
  bytes: ArrayBuffer,
  contentType: string,
): Promise<string> {
  const cfg = await ensureBucket();
  const response = await fetch(`${cfg.url}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      ...headers(cfg),
      "content-type": contentType,
      "cache-control": "public, max-age=3600",
      "x-upsert": "false",
    },
    body: bytes,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`upload_failed:${response.status}:${text.slice(0, 120)}`);
  }

  return publicUrl(path);
}
