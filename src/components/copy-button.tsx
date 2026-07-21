"use client";

import { useState } from "react";

/**
 * Copy-to-clipboard control. Two shapes:
 *  - <CopyButton value=… />       small inline button (put next to a code block)
 *  - <CopyField value=… label=… /> full-width snippet box with a Copy button
 */
export function CopyButton({ value, label = "Copy", className = "" }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback for older browsers / non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={
        "shrink-0 border-2 border-black bg-white px-3 py-1 font-mono text-xs uppercase " +
        "transition-all hover:bg-yellow-300 active:translate-y-0.5 " +
        (copied ? "bg-green-400 " : "") +
        className
      }
    >
      {copied ? "✓ Copied" : label}
    </button>
  );
}

/**
 * A dark snippet block with a floating Copy button — used for install snippets.
 */
export function CopyField({ value, mono = true }: { value: string; mono?: boolean }) {
  return (
    <div className="relative group">
      <pre
        className={
          "brutal-box-sm p-4 pr-24 text-xs bg-gray-900 text-green-400 overflow-x-auto whitespace-pre-wrap break-all " +
          (mono ? "font-mono" : "")
        }
      >
        {value}
      </pre>
      <div className="absolute top-2 right-2">
        <CopyButton value={value} />
      </div>
    </div>
  );
}
