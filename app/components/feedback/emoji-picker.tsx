"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/client";
import { SmileIcon } from "./icons";

const EMOJIS = [
  "😀",
  "😁",
  "😂",
  "🤣",
  "😊",
  "😍",
  "🥰",
  "😎",
  "🤔",
  "😅",
  "😢",
  "😭",
  "😡",
  "😴",
  "🤯",
  "🙃",
  "😉",
  "😌",
  "👍",
  "👎",
  "👏",
  "🙏",
  "💪",
  "🤝",
  "👋",
  "✌️",
  "🫶",
  "❤️",
  "🧡",
  "💙",
  "💚",
  "🔥",
  "✨",
  "🎉",
  "🚀",
  "✅",
  "❌",
  "⚠️",
  "💡",
  "📌",
  "📎",
  "🔒",
  "🔔",
  "⏰",
  "📈",
  "☕",
  "🌱",
  "🙈",
];

export default function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;

    function clamp() {
      if (!panel) return;
      panel.style.transform = "";
      const rect = panel.getBoundingClientRect();
      const pad = 10;
      let minX = pad;
      let minY = pad;
      let maxX = window.innerWidth - pad;
      let maxY = window.innerHeight - pad;

      let node = panel.parentElement;
      while (node && node !== document.body) {
        const style = getComputedStyle(node);
        if (style.overflowX !== "visible" || style.overflowY !== "visible") {
          const box = node.getBoundingClientRect();
          minX = Math.max(minX, box.left + pad);
          maxX = Math.min(maxX, box.right - pad);
          minY = Math.max(minY, box.top + pad);
          maxY = Math.min(maxY, box.bottom - pad);
        }
        node = node.parentElement;
      }

      let x = 0;
      let y = 0;
      if (rect.right > maxX) x = maxX - rect.right;
      else if (rect.left < minX) x = minX - rect.left;
      if (rect.bottom > maxY) y = maxY - rect.bottom;
      else if (rect.top < minY) y = minY - rect.top;
      if (x || y) panel.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    }

    function onPointer(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
    }

    clamp();
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", clamp);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", clamp);
    };
  }, [open]);

  return (
    <div className="fb-emoji" ref={rootRef}>
      <button
        type="button"
        className="fb-emoji-btn"
        aria-label={t("افزودن ایموجی", "Add emoji")}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={t("ایموجی", "Emoji")}
        onClick={() => setOpen((current) => !current)}
      >
        <SmileIcon size={16} />
      </button>

      {open ? (
        <div className="fb-emoji-panel" ref={panelRef} role="dialog" aria-label={t("ایموجی‌ها", "Emojis")}>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onPick(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
