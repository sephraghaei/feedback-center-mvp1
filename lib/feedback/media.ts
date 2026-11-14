export const MEDIA_BUCKET = "post-media";

export function mediaUrl(path: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  if (!url) return "";
  return `${url}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}
