import { productContext } from "@/lib/feedback/product";

function ProductIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9h17" />
      <path d="M3.5 15h17" />
      <path d="M12 3c2.4 2.6 3.6 5.6 3.6 9S14.4 18.4 12 21c-2.4-2.6-3.6-5.6-3.6-9S9.6 5.6 12 3Z" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

export default function ProductTag({
  product,
  variant = "inline",
}: {
  product: string | null;
  variant?: "inline" | "detail";
}) {
  const source = productContext(product);
  if (!source) return null;

  if (variant === "detail") {
    return (
      <div className="fb-product-banner">
        <span className="fb-product-icon" aria-hidden="true">
          <ProductIcon />
        </span>
        <span className="fb-product-text">
          <span className="fb-product-label">بازخورد برای</span>
          {source.href ? (
            <a
              className="fb-product-name"
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
            >
              {source.label}
            </a>
          ) : (
            <span className="fb-product-name" dir="auto">
              {source.label}
            </span>
          )}
        </span>
        {source.href ? (
          <a
            className="fb-product-open"
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`باز کردن ${source.label}`}
            title="باز کردن سایت"
          >
            <ExternalIcon />
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <span className="fb-product-tag" title={source.href ?? source.label}>
      <ProductIcon />
      <span className="fb-product-tag-text" dir="auto">
        {source.label}
      </span>
    </span>
  );
}
