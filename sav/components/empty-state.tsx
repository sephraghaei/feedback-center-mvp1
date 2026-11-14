import Link from "next/link";
import { Icon } from "./icons";

export default function EmptyState({
  title,
  body,
  icon = "bell",
  actionHref,
  actionLabel,
}: {
  title: string;
  body?: string;
  icon?: "feed" | "search" | "bookmark" | "bell" | "building";
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface-2 text-ink-3">
        <Icon name={icon} size={22} />
      </span>
      <p className="mt-4 text-base font-medium text-ink">{title}</p>
      {body ? <p className="mt-1.5 max-w-md text-sm leading-7 text-ink-2">{body}</p> : null}
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn btn-soft mt-5">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
