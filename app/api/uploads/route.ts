import { NextResponse } from "next/server";
import { withApiLogging } from "@/lib/api-logger";
import { getViewer } from "@/lib/feedback/viewer";
import {
  extensionFor,
  isValidAvatar,
  isValidUpload,
  storageConfigured,
  uploadObject,
} from "@/lib/feedback/storage";
import { MAX_FILES } from "@/lib/feedback/constants";

export const POST = withApiLogging("/api/uploads", async (request, _context, log) => {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ message: "برای بارگذاری فایل اول وارد حسابت شو." }, { status: 401 });
  }

  if (!storageConfigured()) {
    log.error("feedback.storage.not_configured");
    return NextResponse.json(
      { message: "فضای ذخیره‌سازی فایل روی سرور تنظیم نشده است." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: "درخواست بارگذاری معتبر نیست." }, { status: 400 });
  }

  const isAvatar = form.get("kind") === "avatar";
  const files = form.getAll("files").filter((value): value is File => value instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ message: "فایلی انتخاب نشده است." }, { status: 400 });
  }
  if (isAvatar && files.length > 1) {
    return NextResponse.json({ message: "برای عکس پروفایل فقط یک فایل بفرست." }, { status: 400 });
  }
  if (!isAvatar && files.length > MAX_FILES) {
    return NextResponse.json(
      { message: `حداکثر ${MAX_FILES} فایل برای هر فید‌بک مجاز است.` },
      { status: 400 },
    );
  }

  const uploaded: {
    path: string;
    fileName: string;
    fileType: string;
    size: number;
  }[] = [];

  for (const file of files) {
    const problem = isAvatar ? isValidAvatar(file) : isValidUpload(file);
    if (problem) {
      return NextResponse.json({ message: problem }, { status: 400 });
    }

    const folder = isAvatar ? "avatars" : "posts";
    const path = `${folder}/${viewer.userId}/${crypto.randomUUID()}.${extensionFor(file.type)}`;
    try {
      await uploadObject(path, await file.arrayBuffer(), file.type);
    } catch (error) {
      log.error("feedback.storage.upload_failed", { message: "Upload failed", error });
      return NextResponse.json({ message: "بارگذاری فایل انجام نشد." }, { status: 502 });
    }

    uploaded.push({
      path,
      fileName: file.name.slice(0, 200),
      fileType: file.type,
      size: file.size,
    });
  }

  log.info("feedback.storage.uploaded", {
    context: { count: uploaded.length, kind: isAvatar ? "avatar" : "post", userRef: viewer.method },
  });

  return NextResponse.json({ files: uploaded });
});
