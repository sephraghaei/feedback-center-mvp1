import { STATUS_LABELS, statusTone } from "@/lib/feedback/labels";

export default function StatusChip({ status, label }: { status: string; label?: string }) {
  return (
    <span className={`fb-chip tone-${statusTone(status)}`}>{label ?? STATUS_LABELS[status] ?? status}</span>
  );
}
