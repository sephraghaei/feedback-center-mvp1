import { productBrand } from "@/lib/feedback/product";
import ProductMark from "./product-mark";

function ExternalIcon() {
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
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

export default function ProductTag({ product }: { product: string | null }) {
  const brand = productBrand(product);
  if (!brand) return null;

  return (
    <div className="fb-product-banner">
      <ProductMark brand={brand} size={46} className="fb-product-mark" />
      <span className="fb-product-text">
        <span className="fb-product-label">فید‌بک برای</span>
        {brand.href ? (
          <a
            className="fb-product-name"
            href={brand.href}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
          >
            {brand.display}
          </a>
        ) : (
          <span className="fb-product-name" dir="auto">
            {brand.display}
          </span>
        )}
      </span>
      {brand.href ? (
        <a
          className="fb-product-open"
          href={brand.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`باز کردن ${brand.display}`}
          title="باز کردن سایت"
        >
          <ExternalIcon />
        </a>
      ) : null}
    </div>
  );
}
