"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ShareIcon } from "./icons";

type ShareState = "idle" | "copied" | "failed";

function legacyCopy(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  area.remove();
  return copied;
}

export default function ShareButton({
  path,
  title,
  label = false,
}: {
  path: string;
  title?: string;
  label?: boolean;
}) {
  const [state, setState] = useState<ShareState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function resetLater() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  }

  async function share() {
    const url = new URL(path, window.location.origin).toString();

    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title, url });
        return;
      }
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(url);
          setState("copied");
          resetLater();
          return;
        } catch {
          // Fall through to the selection based copy below.
        }
      }
      setState(legacyCopy(url) ? "copied" : "failed");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setState("failed");
    }

    resetLater();
  }

  const labelText = state === "copied" ? "Copied" : state === "failed" ? "Failed" : "Share";

  return (
    <button
      type="button"
      className={`fb-action-btn ${state === "copied" ? "on" : ""}`}
      onClick={share}
      aria-label={state === "copied" ? "Link copied" : "Copy link to share"}
      title={state === "failed" ? "Could not copy the link" : "Share"}
    >
      {state === "copied" ? <CheckIcon size={15} /> : <ShareIcon size={15} />}
      {label ? <span>{labelText}</span> : null}
      <span className="sr-only" role="status">
        {state === "copied" ? "Link copied." : ""}
      </span>
    </button>
  );
}
