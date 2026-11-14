"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPostAction } from "@/app/feedback-actions";
import {
  ALLOWED_UPLOAD_TYPES,
  MAX_FILES,
  MAX_FILE_BYTES,
} from "@/lib/feedback/constants";
import { CATEGORY_LABELS } from "@/lib/feedback/labels";
import { MAX_PRODUCT_LENGTH, parseProduct } from "@/lib/feedback/product";
import { mediaUrl } from "@/lib/feedback/media";
import Markdown from "./markdown";

type HeaderViewer = { name: string; role: "customer" | "admin" } | null;

type UploadEntry = {
  key: string;
  name: string;
  type: string;
  size: number;
  progress: number;
  path?: string;
  error?: string;
};

type UploadResponse = {
  files?: { path: string; fileName: string; fileType: string; size: number }[];
  message?: string;
};

const UPLOAD_ACCEPT = ALLOWED_UPLOAD_TYPES.join(",");

function newKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `f-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function Composer({ viewer }: { viewer: HeaderViewer }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"feedback" | "support">("feedback");
  const [category, setCategory] = useState("feature");
  const [product, setProduct] = useState("");
  const [productError, setProductError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);
  const [files, setFiles] = useState<UploadEntry[]>([]);
  const [coverPath, setCoverPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signInRequired, setSignInRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
      setSignInRequired(!viewer);
    }
    window.addEventListener("fc:open-composer", onOpen);
    return () => window.removeEventListener("fc:open-composer", onOpen);
  }, [viewer]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, submitting]);

  function resetDraft() {
    setType("feedback");
    setCategory("feature");
    setProduct("");
    setProductError(null);
    setTitle("");
    setBody("");
    setPreview(false);
    setFiles([]);
    setCoverPath(null);
    setError(null);
    setSignInRequired(false);
  }

  function close() {
    if (submitting) return;
    setOpen(false);
    setError(null);
  }

  function updateEntry(key: string, patch: Partial<UploadEntry>) {
    setFiles((current) => current.map((entry) => (entry.key === key ? { ...entry, ...patch } : entry)));
  }

  function uploadOne(file: File) {
    const key = newKey();
    setFiles((current) => [
      ...current,
      { key, name: file.name, type: file.type, size: file.size, progress: 0 },
    ]);

    const form = new FormData();
    form.append("files", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/uploads");
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      updateEntry(key, { progress: Math.round((event.loaded / event.total) * 100) });
    };
    xhr.onload = () => {
      let data: UploadResponse = {};
      try {
        data = JSON.parse(xhr.responseText) as UploadResponse;
      } catch {
        updateEntry(key, { error: "پاسخ سرور نامعتبر بود." });
        return;
      }
      const uploaded = data.files?.[0];
      if (xhr.status === 200 && uploaded) {
        updateEntry(key, { progress: 100, path: uploaded.path, type: uploaded.fileType, size: uploaded.size });
        if (uploaded.fileType.startsWith("image/")) {
          setCoverPath((current) => current ?? uploaded.path);
        }
        return;
      }
      updateEntry(key, { error: data.message ?? "بارگذاری انجام نشد." });
    };
    xhr.onerror = () => updateEntry(key, { error: "بارگذاری انجام نشد. اتصال را بررسی کن." });
    xhr.send(form);
  }

  function pickFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (list.length === 0) return;

    const room = MAX_FILES - files.length;
    if (room <= 0) {
      setError(`حداکثر ${MAX_FILES} فایل برای هر بازخورد مجاز است.`);
      return;
    }

    for (const file of list.slice(0, room)) {
      if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
        setError("فقط تصویر (PNG، JPG، WebP، GIF) یا PDF مجاز است.");
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError("حجم هر فایل باید کمتر از ۱۰ مگابایت باشد.");
        continue;
      }
      uploadOne(file);
    }
    if (list.length > room) setError(`فقط ${room} فایل دیگر جا دارد.`);
  }

  function removeFile(key: string) {
    const target = files.find((entry) => entry.key === key);
    setFiles((current) => current.filter((entry) => entry.key !== key));
    if (target?.path && coverPath === target.path) setCoverPath(null);
  }

  function surround(before: string, after = before) {
    const el = editorRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = body.slice(start, end) || "متن";
    setBody(body.slice(0, start) + before + selected + after + body.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function prefixLine(prefix: string) {
    const el = editorRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = body.lastIndexOf("\n", start - 1) + 1;
    setBody(body.slice(0, lineStart) + prefix + body.slice(lineStart));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!viewer) {
      setSignInRequired(true);
      return;
    }

    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (!product.trim()) {
      setProductError("نام محصول یا آدرس سایت را بنویس تا مشخص شود بازخورد برای کجاست.");
      return;
    }
    const parsedProduct = parseProduct(product);
    if (!parsedProduct.ok || !parsedProduct.value) {
      setProductError(parsedProduct.ok ? "نام محصول یا آدرس سایت را بنویس." : parsedProduct.message);
      return;
    }
    setProductError(null);
    if (cleanTitle.length < 3 || cleanTitle.length > 140) {
      setError("عنوان باید بین ۳ تا ۱۴۰ نویسه باشد.");
      return;
    }
    if (cleanBody.length < 10) {
      setError("متن بازخورد باید حداقل ۱۰ نویسه باشد.");
      return;
    }
    if (files.some((entry) => !entry.path && !entry.error)) {
      setError("صبر کن تا بارگذاری فایل‌ها تمام شود.");
      return;
    }

    const attachments = files
      .filter((entry): entry is UploadEntry & { path: string } => Boolean(entry.path))
      .map((entry) => ({ path: entry.path, fileName: entry.name, fileType: entry.type, size: entry.size }));

    setSubmitting(true);
    const result = await createPostAction({
      type,
      category: type === "feedback" ? category : null,
      product: parsedProduct.value,
      title: cleanTitle,
      body: cleanBody,
      attachments,
      coverPath,
    });
    setSubmitting(false);

    if (!result.ok) {
      if (result.signIn) setSignInRequired(true);
      setError(result.error);
      return;
    }

    setOpen(false);
    resetDraft();
    router.push(`/p/${result.id}`);
    router.refresh();
  }

  if (!open) return null;

  const uploading = files.some((entry) => !entry.path && !entry.error);
  const signInHref = `/?next=${encodeURIComponent(pathname)}#account`;
  const clerkHref = `/sign-in?redirect_url=${encodeURIComponent(pathname)}`;

  return (
    <div
      className="backdrop fb-composer-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="modal fb-composer" role="dialog" aria-modal="true" aria-labelledby="composer-title">
        <div className="fb-composer-head">
          <div>
            <h2 id="composer-title" className="modal-title">
              ثبت بازخورد
            </h2>
            <p className="modal-hint">بازخورد محصول را عمومی بنویس، یا درخواست شخصی را فقط برای مدیر بفرست.</p>
          </div>
          <button type="button" className="fb-btn fb-btn-ghost fb-btn-sm" onClick={close} disabled={submitting}>
            بستن
          </button>
        </div>

        {signInRequired ? (
          <div className="fb-signin-card">
            <p>برای ثبت بازخورد یک حساب لازم است. بعد از ورود به همین صفحه برمی‌گردی.</p>
            <div className="fb-signin-actions">
              <Link href={signInHref} className="fb-btn fb-btn-primary">
                ورود با موبایل یا ایمیل
              </Link>
              <Link href={clerkHref} className="fb-btn">
                ورود با Google
              </Link>
            </div>
          </div>
        ) : (
          <form className="fb-form" onSubmit={submit} noValidate>
            <div className="fb-seg" role="tablist" aria-label="نوع نوشته">
              <button
                type="button"
                role="tab"
                aria-selected={type === "feedback"}
                className={type === "feedback" ? "active" : ""}
                onClick={() => setType("feedback")}
              >
                بازخورد محصول
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={type === "support"}
                className={type === "support" ? "active" : ""}
                onClick={() => setType("support")}
              >
                درخواست شخصی
              </button>
            </div>

            {type === "support" ? (
              <p className="fb-note" style={{ marginTop: 0 }}>
                این درخواست عمومی نمی‌شود و فقط نویسنده و مدیر آن را می‌بینند.
              </p>
            ) : (
              <label className="label" htmlFor="composer-category">
                دسته
                <select
                  id="composer-category"
                  className="input"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  style={{ marginTop: 6 }}
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="label" htmlFor="composer-product">
              نام محصول یا آدرس سایت <span className="required">الزامی</span>
            </label>
            <input
              id="composer-product"
              className="input"
              value={product}
              maxLength={MAX_PRODUCT_LENGTH}
              aria-required="true"
              aria-invalid={productError ? true : undefined}
              aria-describedby={productError ? "composer-product-error" : "composer-product-hint"}
              onChange={(event) => {
                setProduct(event.target.value);
                if (productError) setProductError(null);
              }}
              placeholder="مثلا: فروشگاه من یا example.com"
            />
            <p id="composer-product-hint" className="field-hint" style={{ marginTop: 0 }}>
              بازخورد به همین محصول وصل می‌شود و بالای کارتش نشان داده می‌شود.
            </p>
            {productError ? (
              <p id="composer-product-error" className="field-error">
                {productError}
              </p>
            ) : null}

            <label className="label" htmlFor="composer-post-title">
              عنوان
            </label>
            <input
              id="composer-post-title"
              className="input"
              value={title}
              maxLength={140}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="مثلا: امکان خروجی گرفتن از گزارش‌ها"
            />

            <div className="fb-editor-tabs">
              <span className="label">{type === "feedback" ? "توضیح بازخورد" : "توضیح درخواست"}</span>
              <div className="fb-filters" role="tablist" aria-label="حالت ویرایش">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!preview}
                  className={`fb-filter ${!preview ? "active" : ""}`}
                  onClick={() => setPreview(false)}
                >
                  نوشتن
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={preview}
                  className={`fb-filter ${preview ? "active" : ""}`}
                  onClick={() => setPreview(true)}
                >
                  پیش‌نمایش
                </button>
              </div>
            </div>

            {preview ? (
              <div className="fb-preview">
                {body.trim() ? <Markdown source={body} /> : <span className="field-hint">چیزی برای پیش‌نمایش نیست.</span>}
              </div>
            ) : (
              <>
                <div className="fb-toolbar" role="toolbar" aria-label="قالب‌بندی">
                  <button type="button" className="fb-tool" onClick={() => prefixLine("## ")} title="عنوان">
                    H
                  </button>
                  <button type="button" className="fb-tool" onClick={() => surround("**")} title="ضخیم">
                    <strong>B</strong>
                  </button>
                  <button type="button" className="fb-tool" onClick={() => surround("_")} title="مورب">
                    <em>I</em>
                  </button>
                  <button type="button" className="fb-tool" onClick={() => prefixLine("- ")} title="فهرست">
                    فهرست
                  </button>
                  <button type="button" className="fb-tool" onClick={() => surround("[", "](https://)")} title="پیوند">
                    پیوند
                  </button>
                  <button type="button" className="fb-tool" onClick={() => surround("`")} title="کد درون‌خطی">
                    <code>{"`"}</code>
                  </button>
                </div>
                <textarea
                  ref={editorRef}
                  className="input fb-textarea"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder={"جزئیات را بنویس. مارک‌داون ساده پشتیبانی می‌شود: ## عنوان، **ضخیم**، - فهرست"}
                  aria-label="متن بازخورد"
                />
              </>
            )}

            <div className="fb-editor-tabs">
              <span className="label">پیوست‌ها</span>
              <span className="field-hint">تصویر یا PDF، تا ۵ فایل و ۱۰ مگابایت هر فایل</span>
            </div>

            <label className="fb-dropzone">
              <input type="file" multiple accept={UPLOAD_ACCEPT} onChange={pickFiles} />
              <span>{files.length >= MAX_FILES ? "ظرفیت پیوست پر شد." : "فایل‌ها را انتخاب کن یا همین‌جا رها کن."}</span>
              <span className="field-hint">تصویر اول به عنوان کاور استفاده می‌شود.</span>
            </label>

            {files.length > 0 ? (
              <div className="fb-files">
                {files.map((entry) => (
                  <div key={entry.key} className="fb-file">
                    {entry.path && entry.type.startsWith("image/") ? (
                      <img className="fb-file-thumb" src={mediaUrl(entry.path)} alt="" />
                    ) : (
                      <span className="fb-file-thumb">{entry.type === "application/pdf" ? "PDF" : "فایل"}</span>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div className="fb-file-name">{entry.name}</div>
                      {entry.error ? (
                        <div className="field-hint" style={{ color: "var(--red)" }}>
                          {entry.error}
                        </div>
                      ) : entry.path ? (
                        <div className="field-hint">
                          {entry.type.startsWith("image/") && coverPath === entry.path ? "کاور انتخاب شده" : "بارگذاری شد"}
                        </div>
                      ) : null}
                    </div>
                    <div className="fb-file-actions">
                      {entry.path && entry.type.startsWith("image/") ? (
                        <button
                          type="button"
                          className={coverPath === entry.path ? "cover-on" : ""}
                          onClick={() => setCoverPath(entry.path ?? null)}
                        >
                          {coverPath === entry.path ? "کاور" : "انتخاب کاور"}
                        </button>
                      ) : null}
                      <button type="button" onClick={() => removeFile(entry.key)}>
                        حذف
                      </button>
                    </div>
                    {!entry.path && !entry.error ? (
                      <div className="fb-progress">
                        <span style={{ width: `${entry.progress}%` }} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {error ? <div className="fb-alert">{error}</div> : null}

            <div className="fb-modal-foot">
              <p>
                {type === "feedback"
                  ? "بازخورد محصول عمومی است و همه می‌بینند."
                  : "درخواست شخصی فقط برای تو و مدیر نمایش داده می‌شود."}
              </p>
              <button type="submit" className="fb-btn fb-btn-primary" disabled={submitting || uploading}>
                {submitting ? "در حال ثبت..." : uploading ? "در حال بارگذاری..." : "ثبت"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
