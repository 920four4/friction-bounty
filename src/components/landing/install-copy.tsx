"use client";

import { useState } from "react";

export function InstallCopy({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="lp-terminal">
      <div className="lp-terminal-bar">
        <span className="lp-dot lp-dot-r" />
        <span className="lp-dot lp-dot-y" />
        <span className="lp-dot lp-dot-g" />
        <span className="lp-terminal-title">install.sh</span>
        <button type="button" onClick={copy} className="lp-copy-btn" aria-live="polite">
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      <pre className="lp-terminal-body">
        <span className="lp-term-prompt">$</span>{" "}
        <span className="lp-term-code">{code}</span>
        <span className="lp-cursor" aria-hidden />
      </pre>
    </div>
  );
}
