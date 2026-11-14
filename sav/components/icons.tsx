type IconName =
  | "feed"
  | "search"
  | "bookmark"
  | "bell"
  | "sliders"
  | "plus"
  | "user"
  | "arrow"
  | "external"
  | "logout"
  | "check"
  | "close"
  | "building"
  | "shield"
  | "globe"
  | "clock"
  | "mail"
  | "menu";

const paths: Record<IconName, React.ReactNode> = {
  feed: (
    <>
      <path d="M4 6h12M4 10h12M4 14h8" />
    </>
  ),
  search: (
    <>
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13.4 13.4 3 3" />
    </>
  ),
  bookmark: <path d="M6 4.5h8a1 1 0 0 1 1 1v11l-5-3-5 3v-11a1 1 0 0 1 1-1Z" />,
  bell: (
    <>
      <path d="M6 9a4 4 0 0 1 8 0c0 3 1 4 1.5 4.5H4.5C5 13 6 12 6 9Z" />
      <path d="M8.5 16a1.8 1.8 0 0 0 3 0" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h8M15 7h1M4 13h2M9 13h7" />
      <circle cx="13" cy="7" r="1.6" />
      <circle cx="7" cy="13" r="1.6" />
    </>
  ),
  plus: <path d="M10 4v12M4 10h12" />,
  user: (
    <>
      <circle cx="10" cy="7.5" r="3" />
      <path d="M4.5 16c.8-2.5 2.9-4 5.5-4s4.7 1.5 5.5 4" />
    </>
  ),
  arrow: <path d="M4 10h11M11 5.5 15.5 10 11 14.5" />,
  external: (
    <>
      <path d="M11 4h5v5M16 4l-7 7" />
      <path d="M15 12v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3" />
    </>
  ),
  logout: (
    <>
      <path d="M12 5H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6" />
      <path d="M9 10h8M14 7l3 3-3 3" />
    </>
  ),
  check: <path d="m4.5 10.5 3.5 3.5 7.5-8" />,
  close: <path d="m5 5 10 10M15 5 5 15" />,
  building: (
    <>
      <path d="M4 16V5.5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1V16" />
      <path d="M12 9h3a1 1 0 0 1 1 1v6M3 16h14M7 8h2M7 11h2M7 14h2" />
    </>
  ),
  shield: (
    <>
      <path d="M10 3.5 16 6v4.5c0 3.2-2.4 5.3-6 6.5-3.6-1.2-6-3.3-6-6.5V6l6-2.5Z" />
      <path d="m7.5 10 1.8 1.8 3.4-3.6" />
    </>
  ),
  globe: (
    <>
      <circle cx="10" cy="10" r="6.5" />
      <path d="M3.8 8h12.4M3.8 12h12.4M10 3.5c1.8 1.8 2.7 4 2.7 6.5S11.8 14.7 10 16.5C8.2 14.7 7.3 12.5 7.3 10S8.2 5.3 10 3.5Z" />
    </>
  ),
  clock: (
    <>
      <circle cx="10" cy="10" r="6.5" />
      <path d="M10 6.5V10l2.5 1.5" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5" width="13" height="10" rx="1.5" />
      <path d="m4 6 6 4.5L16 6" />
    </>
  ),
  menu: <path d="M4 6h12M4 10h12M4 14h12" />,
};

export function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand text-white"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 20 20" fill="none">
        <path d="M5 13.5v-7M10 16V4M15 11.5v-3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}
