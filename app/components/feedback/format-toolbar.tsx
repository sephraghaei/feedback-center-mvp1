"use client";

import type { RefObject } from "react";
import EmojiPicker from "./emoji-picker";
import {
  BoldIcon,
  CodeBlockIcon,
  CodeIcon,
  HeadingIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  OrderedListIcon,
  QuoteIcon,
} from "./icons";

export default function FormatToolbar({
  value,
  onChange,
  textareaRef,
  compact,
}: {
  value: string;
  onChange: (value: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  compact?: boolean;
}) {
  function surround(before: string, after = before) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || "متن";
    onChange(value.slice(0, start) + before + selected + after + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function prefixLine(prefix: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    onChange(value.slice(0, lineStart) + prefix + value.slice(lineStart));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  }

  function fence() {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || "کد";
    const before = "```\n";
    const after = "\n```";
    onChange(value.slice(0, start) + before + selected + after + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function insertEmoji(emoji: string) {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? start;
    onChange(value.slice(0, start) + emoji + value.slice(end));
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const position = start + emoji.length;
      el.setSelectionRange(position, position);
    });
  }

  return (
    <div className={`fb-format ${compact ? "compact" : ""}`} role="toolbar" aria-label="قالب‌بندی متن">
      <button type="button" className="fb-tool" onClick={() => prefixLine("## ")} title="عنوان" aria-label="عنوان">
        <HeadingIcon size={15} />
      </button>
      <button type="button" className="fb-tool" onClick={() => surround("**")} title="ضخیم" aria-label="ضخیم">
        <BoldIcon size={15} />
      </button>
      <button type="button" className="fb-tool" onClick={() => surround("_")} title="مورب" aria-label="مورب">
        <ItalicIcon size={15} />
      </button>
      <button
        type="button"
        className="fb-tool"
        onClick={() => prefixLine("> ")}
        title="نقل‌قول"
        aria-label="نقل‌قول"
      >
        <QuoteIcon size={15} />
      </button>
      <button
        type="button"
        className="fb-tool"
        onClick={() => prefixLine("- ")}
        title="فهرست نقطه‌ای"
        aria-label="فهرست نقطه‌ای"
      >
        <ListIcon size={15} />
      </button>
      <button
        type="button"
        className="fb-tool"
        onClick={() => prefixLine("1. ")}
        title="فهرست شماره‌دار"
        aria-label="فهرست شماره‌دار"
      >
        <OrderedListIcon size={15} />
      </button>
      <button
        type="button"
        className="fb-tool"
        onClick={() => surround("[", "](https://)")}
        title="پیوند"
        aria-label="پیوند"
      >
        <LinkIcon size={15} />
      </button>
      <button
        type="button"
        className="fb-tool"
        onClick={() => surround("`")}
        title="کد درون‌خطی"
        aria-label="کد درون‌خطی"
      >
        <CodeIcon size={15} />
      </button>
      <button
        type="button"
        className="fb-tool"
        onClick={fence}
        title="بلوک کد"
        aria-label="بلوک کد"
      >
        <CodeBlockIcon size={15} />
      </button>
      <span className="fb-format-sep" aria-hidden="true" />
      <EmojiPicker onPick={insertEmoji} />
    </div>
  );
}
