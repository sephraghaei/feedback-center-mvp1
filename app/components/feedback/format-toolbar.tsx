"use client";

import type { RefObject } from "react";
import { useT } from "@/lib/i18n/client";
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
  const t = useT();

  function surround(before: string, after = before) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || t("متن", "text");
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
    const selected = value.slice(start, end) || t("کد", "code");
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
    <div
      className={`fb-format ${compact ? "compact" : ""}`}
      role="toolbar"
      aria-label={t("قالب‌بندی متن", "Text formatting")}
    >
      <button type="button" className="fb-tool" onClick={() => prefixLine("## ")} title={t("عنوان", "Heading")} aria-label={t("عنوان", "Heading")}>
        <HeadingIcon size={15} />
      </button>
      <button type="button" className="fb-tool" onClick={() => surround("**")} title={t("ضخیم", "Bold")} aria-label={t("ضخیم", "Bold")}>
        <BoldIcon size={15} />
      </button>
      <button type="button" className="fb-tool" onClick={() => surround("_")} title={t("مورب", "Italic")} aria-label={t("مورب", "Italic")}>
        <ItalicIcon size={15} />
      </button>
      <button
        type="button"
        className="fb-tool"
        onClick={() => prefixLine("> ")}
        title={t("نقل‌قول", "Quote")}
        aria-label={t("نقل‌قول", "Quote")}
      >
        <QuoteIcon size={15} />
      </button>
      <button
        type="button"
        className="fb-tool"
        onClick={() => prefixLine("- ")}
        title={t("فهرست نقطه‌ای", "Bulleted list")}
        aria-label={t("فهرست نقطه‌ای", "Bulleted list")}
      >
        <ListIcon size={15} />
      </button>
      <button
        type="button"
        className="fb-tool"
        onClick={() => prefixLine("1. ")}
        title={t("فهرست شماره‌دار", "Numbered list")}
        aria-label={t("فهرست شماره‌دار", "Numbered list")}
      >
        <OrderedListIcon size={15} />
      </button>
      <button
        type="button"
        className="fb-tool"
        onClick={() => surround("[", "](https://)")}
        title={t("پیوند", "Link")}
        aria-label={t("پیوند", "Link")}
      >
        <LinkIcon size={15} />
      </button>
      <button
        type="button"
        className="fb-tool"
        onClick={() => surround("`")}
        title={t("کد درون‌خطی", "Inline code")}
        aria-label={t("کد درون‌خطی", "Inline code")}
      >
        <CodeIcon size={15} />
      </button>
      <button
        type="button"
        className="fb-tool"
        onClick={fence}
        title={t("بلوک کد", "Code block")}
        aria-label={t("بلوک کد", "Code block")}
      >
        <CodeBlockIcon size={15} />
      </button>
      <span className="fb-format-sep" aria-hidden="true" />
      <EmojiPicker onPick={insertEmoji} />
    </div>
  );
}
