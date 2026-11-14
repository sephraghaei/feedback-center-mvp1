export default function BrandMark({
  className,
  simple = false,
}: {
  className?: string;
  simple?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="3.4"
        y="4.2"
        width="17.2"
        height="13"
        rx="3.8"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <circle cx="12" cy="10.7" r="2.1" fill="currentColor" />
      {simple ? null : (
        <path
          d="M8.6 17.2 6.2 21.4 12.6 17.2"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
