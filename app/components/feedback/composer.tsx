"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPostAction } from "@/app/feedback-actions";
import {
  MAX_PRODUCT_LENGTH,
  MAX_SITE_URL_LENGTH,
  parseProduct,
  parseSiteUrl,
  productBrand,
} from "@/lib/feedback/product";
import { KIND_LABELS, type FeedbackKind } from "@/lib/feedback/labels";
import FormatToolbar from "./format-toolbar";
import { AlertIcon, BulbIcon, CloseIcon, HeartIcon } from "./icons";
import Markdown from "./markdown";
import ProductMark from "./product-mark";

type HeaderViewer = { name: string; role: "customer" | "admin" } | null;

const KIND_OPTIONS = [
  { value: "bug", label: KIND_LABELS.bug, Icon: AlertIcon },
  { value: "praise", label: KIND_LABELS.praise, Icon: HeartIcon },
  { value: "improvement", label: KIND_LABELS.improvement, Icon: BulbIcon },
] as const;

export default function Composer({ viewer }: { viewer: HeaderViewer }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"feedback" | "support">("feedback");
  const [kind, setKind] = useState<FeedbackKind>("improvement");
  const [product, setProduct] = useState("");
  const [productError, setProductError] = useState<string | null>(null);
  const [siteUrl, setSiteUrl] = useState("");
  const [siteUrlError, setSiteUrlError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);
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
    setKind("improvement");
    setProduct("");
    setProductError(null);
    setSiteUrl("");
    setSiteUrlError(null);
    setTitle("");
    setBody("");
    setPreview(false);
    setError(null);
    setSignInRequired(false);
  }

  function close() {
    if (submitting) return;
    setOpen(false);
    setError(null);
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
      setProductError("نام محصول را بنویس تا مشخص شود فید‌بک برای کجاست.");
      return;
    }
    const parsedProduct = parseProduct(product);
    if (!parsedProduct.ok || !parsedProduct.value) {
      setProductError(parsedProduct.ok ? "نام محصول را بنویس." : parsedProduct.message);
      return;
    }
    setProductError(null);
    const parsedSite = parseSiteUrl(siteUrl);
    if (!parsedSite.ok) {
      setSiteUrlError(parsedSite.message);
      return;
    }
    setSiteUrlError(null);
    if (cleanTitle.length < 3 || cleanTitle.length > 140) {
      setError("عنوان باید بین ۳ تا ۱۴۰ نویسه باشد.");
      return;
    }
    if (cleanBody.length < 10) {
      setError("متن فید‌بک باید حداقل ۱۰ نویسه باشد.");
      return;
    }

    setSubmitting(true);
    const result = await createPostAction({
      type,
      category: kind,
      product: parsedProduct.value,
      productUrl: parsedSite.value,
      title: cleanTitle,
      body: cleanBody,
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

  const signInHref = `/?next=${encodeURIComponent(pathname)}#account`;
  const clerkHref = `/sign-in?redirect_url=${encodeURIComponent(pathname)}`;
  const previewBrand = productBrand(product, siteUrl);

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
              ثبت فید‌بک
            </h2>
            <p className="modal-hint">فید‌بک محصول را عمومی بنویس، یا درخواست شخصی را فقط برای مدیر بفرست.</p>
          </div>
          <button
            type="button"
            className="fb-icon-btn"
            onClick={close}
            disabled={submitting}
            aria-label="بستن"
            title="بستن"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {signInRequired ? (
          <div className="fb-signin-card">
            <p>برای ثبت فید‌بک یک حساب لازم است. بعد از ورود به همین صفحه برمی‌گردی.</p>
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
                فید‌بک محصول
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
              <div className="fb-kind-field">
                <span className="label" id="composer-kind-label">
                  نوع فید‌بک
                </span>
                <div className="fb-kind-picker" role="group" aria-labelledby="composer-kind-label">
                  {KIND_OPTIONS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={kind === value}
                      className={`fb-kind-option kind-${value} ${kind === value ? "active" : ""}`}
                      onClick={() => setKind(value)}
                    >
                      <Icon size={15} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="label" htmlFor="composer-product">
              نام محصول <span className="required">الزامی</span>
            </label>
            <input
              id="composer-product"
              className="input"
              value={product}
              maxLength={MAX_PRODUCT_LENGTH}
              aria-required="true"
              aria-invalid={productError ? true : undefined}
              aria-describedby={productError ? "composer-product-error" : undefined}
              onChange={(event) => {
                setProduct(event.target.value);
                if (productError) setProductError(null);
              }}
              placeholder="مثلا: فروشگاه من"
            />
            {productError ? (
              <p id="composer-product-error" className="field-error">
                {productError}
              </p>
            ) : null}

            <label className="label" htmlFor="composer-product-url">
              آدرس سایت <span className="optional">اختیاری</span>
            </label>
            <input
              id="composer-product-url"
              className="input"
              dir="ltr"
              inputMode="url"
              autoComplete="url"
              value={siteUrl}
              maxLength={MAX_SITE_URL_LENGTH}
              aria-invalid={siteUrlError ? true : undefined}
              aria-describedby={
                siteUrlError ? "composer-product-url-error" : "composer-product-url-hint"
              }
              onChange={(event) => {
                setSiteUrl(event.target.value);
                if (siteUrlError) setSiteUrlError(null);
              }}
              placeholder="example.com"
            />
            <p id="composer-product-url-hint" className="field-hint" style={{ marginTop: 0 }}>
              آدرس سایت را بده تا لوگوی خودش روی کارت فید‌بک بیاید.
            </p>
            {siteUrlError ? (
              <p id="composer-product-url-error" className="field-error">
                {siteUrlError}
              </p>
            ) : null}

            {previewBrand ? (
              <div className="fb-composer-brand">
                <ProductMark brand={previewBrand} size={30} />
                <span className="fb-composer-brand-text">
                  <span className="fb-composer-brand-name" dir="auto">
                    {previewBrand.display}
                  </span>
                  <span className="field-hint">
                    {previewBrand.host
                      ? "نشان همین سایت روی کارت می‌آید."
                      : "بدون آدرس سایت فقط نام محصول نمایش داده می‌شود."}
                  </span>
                </span>
              </div>
            ) : null}

            <label className="label" htmlFor="composer-post-title">
              عنوان <span className="required">الزامی</span>
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
              <span className="label">{type === "feedback" ? "توضیح فید‌بک" : "توضیح درخواست"}</span>
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
                <textarea
                  ref={editorRef}
                  className="input fb-textarea"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="جزئیات را بنویس و از نوار پایین برای عنوان، فهرست، پیوند و بقیه قالب‌بندی‌ها استفاده کن."
                  aria-label="متن فید‌بک"
                />
                <FormatToolbar value={body} onChange={setBody} textareaRef={editorRef} />
              </>
            )}

            {error ? <div className="fb-alert">{error}</div> : null}

            <div className="fb-modal-foot">
              <p>
                {type === "feedback"
                  ? "فید‌بک محصول عمومی است و همه می‌بینند."
                  : "درخواست شخصی فقط برای تو و مدیر نمایش داده می‌شود."}
              </p>
              <div className="fb-modal-actions">
                <button type="button" className="fb-btn fb-btn-ghost" onClick={close} disabled={submitting}>
                  بی‌خیال
                </button>
                <button type="submit" className="fb-btn fb-btn-primary" disabled={submitting}>
                  {submitting ? "در حال ثبت..." : "انتشار فید‌بک"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
