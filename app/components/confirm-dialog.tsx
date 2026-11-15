"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "حذف",
  cancelLabel = "بی‌خیال",
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const handlers = useRef({ onCancel, busy });

  useEffect(() => {
    handlers.current = { onCancel, busy };
  });

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !handlers.current.busy) {
        handlers.current.onCancel();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div
        className="modal confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <h2 id={titleId} className="modal-title">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="modal-hint">
            {description}
          </p>
        ) : null}
        <div className="confirm-actions">
          <button ref={cancelRef} type="button" className="confirm-btn" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className="confirm-btn confirm-btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? "در حال حذف..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
