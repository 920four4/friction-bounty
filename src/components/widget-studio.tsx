"use client";

import { useMemo, useState } from "react";

export type WidgetStudioValues = {
  primaryColor: string;
  position: "bottom-right" | "bottom-left";
  welcomeMessage: string;
  bountyAmount: string;
  style: "brutal" | "soft" | "pill";
  buttonLabel: string;
  offsetBottom: number;
  orgName: string;
};

const PRESETS = [
  { name: "FB Yellow", color: "#FFE100" },
  { name: "Black", color: "#111111" },
  { name: "Blue", color: "#2563EB" },
  { name: "Green", color: "#16A34A" },
  { name: "Coral", color: "#F97316" },
  { name: "Violet", color: "#7C3AED" },
];

const STYLES: { id: WidgetStudioValues["style"]; label: string; blurb: string }[] = [
  { id: "brutal", label: "Bold", blurb: "Hard edges + thick border — matches Friction Bounty" },
  { id: "soft", label: "Soft", blurb: "Rounded, light shadow — fits most SaaS UIs" },
  { id: "pill", label: "Pill", blurb: "Round launcher — closest to chat bubbles" },
];

type Props = {
  initial: WidgetStudioValues;
};

export function WidgetStudio({ initial }: Props) {
  const [primaryColor, setPrimaryColor] = useState(initial.primaryColor || "#FFE100");
  const [position, setPosition] = useState<WidgetStudioValues["position"]>(
    initial.position === "bottom-left" ? "bottom-left" : "bottom-right",
  );
  const [welcomeMessage, setWelcomeMessage] = useState(initial.welcomeMessage);
  const [bountyAmount, setBountyAmount] = useState(initial.bountyAmount || "10.00");
  const [style, setStyle] = useState<WidgetStudioValues["style"]>(
    (["brutal", "soft", "pill"].includes(initial.style) ? initial.style : "brutal") as WidgetStudioValues["style"],
  );
  const [buttonLabel, setButtonLabel] = useState(initial.buttonLabel || "");
  const [offsetBottom, setOffsetBottom] = useState(initial.offsetBottom ?? 20);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [showChatMock, setShowChatMock] = useState(true);

  const tokens = useMemo(() => styleTokens(style), [style]);
  const hasLabel = buttonLabel.trim().length > 0;
  const isLeft = position === "bottom-left";

  return (
    <div className="space-y-4">
      {/* hidden fields submitted with parent form */}
      <input type="hidden" name="widgetPrimaryColor" value={primaryColor} />
      <input type="hidden" name="widgetPosition" value={position} />
      <input type="hidden" name="widgetWelcomeMessage" value={welcomeMessage} />
      <input type="hidden" name="defaultBountyAmount" value={bountyAmount} />
      <input type="hidden" name="widgetStyle" value={style} />
      <input type="hidden" name="widgetButtonLabel" value={buttonLabel} />
      <input type="hidden" name="widgetOffsetBottom" value={String(offsetBottom)} />

      <div className="grid lg:grid-cols-[1fr_1.15fr] gap-5">
        {/* Controls */}
        <div className="space-y-5">
          <div>
            <h2 className="font-mono font-bold uppercase text-sm mb-1">What visitors see</h2>
            <p className="text-sm text-gray-600">
              Edit on the left — the mock website on the right updates live. Save to push to your live install
              (no snippet change needed).
            </p>
          </div>

          <ControlBlock title="Brand color">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {PRESETS.map((p) => (
                <button
                  key={p.color}
                  type="button"
                  title={p.name}
                  onClick={() => setPrimaryColor(p.color)}
                  className={
                    "w-8 h-8 border-2 border-black " +
                    (primaryColor.toUpperCase() === p.color.toUpperCase() ? "ring-2 ring-offset-1 ring-black" : "")
                  }
                  style={{ background: p.color }}
                />
              ))}
              <label className="flex items-center gap-2 font-mono text-xs ml-1">
                Custom
                <input
                  type="color"
                  value={normalizeHex(primaryColor)}
                  onChange={(e) => setPrimaryColor(e.target.value.toUpperCase())}
                  className="w-10 h-8 border-2 border-black p-0 bg-white cursor-pointer"
                />
              </label>
            </div>
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="brutal-input font-mono text-sm"
              placeholder="#FFE100"
              pattern="^#?[0-9A-Fa-f]{6}$"
            />
          </ControlBlock>

          <ControlBlock title="Style (match your brand)">
            <div className="grid gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id)}
                  className={
                    "text-left p-3 border-2 border-black transition-colors " +
                    (style === s.id ? "bg-yellow-300" : "bg-white hover:bg-gray-50")
                  }
                >
                  <p className="font-mono text-sm font-bold uppercase">{s.label}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{s.blurb}</p>
                </button>
              ))}
            </div>
          </ControlBlock>

          <ControlBlock title="Corner & chat widgets">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="brutal-label">Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as WidgetStudioValues["position"])}
                  className="brutal-input"
                >
                  <option value="bottom-right">Bottom right</option>
                  <option value="bottom-left">Bottom left</option>
                </select>
              </div>
              <div>
                <label className="brutal-label">Lift from bottom (px)</label>
                <input
                  type="number"
                  min={8}
                  max={120}
                  value={offsetBottom}
                  onChange={(e) => setOffsetBottom(Math.min(120, Math.max(8, Number(e.target.value) || 20)))}
                  className="brutal-input"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-mono leading-relaxed">
              Have Intercom / Zendesk / Crisp on the same corner? Switch sides, or raise “lift” (e.g. 80–90px) so the
              button sits above their chat bubble. Toggle the gray chat mock in the preview to check.
            </p>
            <label className="flex items-center gap-2 mt-2 font-mono text-xs">
              <input
                type="checkbox"
                checked={showChatMock}
                onChange={(e) => setShowChatMock(e.target.checked)}
                className="w-4 h-4 border-2 border-black"
              />
              Show mock support chat in preview
            </label>
          </ControlBlock>

          <ControlBlock title="Launcher button">
            <label className="brutal-label">Label (optional)</label>
            <input
              type="text"
              value={buttonLabel}
              onChange={(e) => setButtonLabel(e.target.value.slice(0, 40))}
              className="brutal-input"
              placeholder="Leave empty for icon only — or try: Report a bug"
              maxLength={40}
            />
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Empty = square/round icon. With text = labeled button (clearer for first-time visitors).
            </p>
          </ControlBlock>

          <ControlBlock title="Form copy & bounty">
            <label className="brutal-label">Welcome message</label>
            <textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={2}
              className="brutal-input mb-3"
            />
            <label className="brutal-label">Default bounty shown ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={bountyAmount}
              onChange={(e) => setBountyAmount(e.target.value)}
              className="brutal-input"
            />
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Visitors see “Earn $X credit” on the form. You can still change amount when approving.
            </p>
          </ControlBlock>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen((v) => !v)}
              className="brutal-btn text-sm"
            >
              {previewOpen ? "Preview: form open" : "Preview: button only"} — click to toggle
            </button>
          </div>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-24 self-start space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-xs uppercase text-gray-500">Live preview · your site</p>
            <p className="font-mono text-[10px] text-gray-400">Not a screenshot — real layout</p>
          </div>

          <div className="relative border-2 border-black bg-white shadow-[6px_6px_0_#000] overflow-hidden h-[520px] select-none">
            {/* Fake browser chrome */}
            <div className="h-9 border-b-2 border-black bg-gray-100 flex items-center gap-2 px-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 border border-black" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-black" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 border border-black" />
              <div className="flex-1 ml-2 h-5 bg-white border border-black/20 rounded-sm px-2 font-mono text-[10px] text-gray-500 flex items-center truncate">
                {initial.orgName || "yoursite.com"}/checkout
              </div>
            </div>

            {/* Fake page content */}
            <div className="absolute inset-x-0 top-9 bottom-0 bg-[#f4f4f5] p-4 overflow-hidden">
              <div className="h-full border border-dashed border-gray-300 bg-white/70 p-4">
                <div className="h-3 w-1/3 bg-gray-200 mb-3" />
                <div className="h-3 w-2/3 bg-gray-100 mb-2" />
                <div className="h-3 w-1/2 bg-gray-100 mb-6" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-24 bg-gray-100 border border-gray-200" />
                  <div className="h-24 bg-gray-100 border border-gray-200" />
                </div>
                <p className="mt-6 font-mono text-[10px] text-gray-400 uppercase">
                  Mock page — only the corner widget is real
                </p>
              </div>

              {/* Mock chat widget (opposite or same corner offset) */}
              {showChatMock && (
                <div
                  className="absolute flex flex-col items-end gap-2"
                  style={{
                    bottom: 20,
                    [isLeft ? "right" : "left"]: 20,
                  }}
                >
                  <div className="bg-white border border-gray-300 shadow-lg rounded-2xl px-3 py-2 text-[10px] text-gray-500 max-w-[120px]">
                    Support chat (mock)
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#1f8ceb] shadow-lg flex items-center justify-center text-white text-xl">
                    💬
                  </div>
                </div>
              )}

              {/* Friction Bounty launcher */}
              <button
                type="button"
                onClick={() => setPreviewOpen((v) => !v)}
                aria-label={buttonLabel.trim() || "Report an issue"}
                className="absolute flex items-center justify-center gap-2 font-semibold text-[13px] transition-transform hover:-translate-y-0.5"
                style={{
                  bottom: offsetBottom,
                  [isLeft ? "left" : "right"]: 20,
                  background: primaryColor,
                  border: tokens.border,
                  borderRadius: tokens.radius,
                  boxShadow: tokens.shadow,
                  width: hasLabel ? "auto" : 56,
                  height: hasLabel ? 48 : 56,
                  padding: hasLabel ? "0 14px" : 0,
                  color: "#000",
                }}
              >
                <ChatIcon />
                {hasLabel && (
                  <span className="max-w-[120px] truncate">{buttonLabel.trim()}</span>
                )}
              </button>

              {/* Report panel */}
              {previewOpen && (
                <div
                  className="absolute flex flex-col overflow-hidden bg-white"
                  style={{
                    bottom: offsetBottom + (hasLabel ? 60 : 68),
                    [isLeft ? "left" : "right"]: 20,
                    width: "min(340px, calc(100% - 40px))",
                    maxHeight: 380,
                    border: tokens.border,
                    borderRadius: tokens.radiusSm,
                    boxShadow: tokens.shadow,
                  }}
                >
                  <div
                    className="flex items-center justify-between px-3 py-2.5 shrink-0"
                    style={{
                      background: primaryColor,
                      borderBottom: tokens.border,
                    }}
                  >
                    <h3
                      className="m-0 text-[13px] font-semibold"
                      style={{
                        fontFamily: tokens.fontHeader,
                        textTransform: tokens.headerTransform as "none" | "uppercase",
                        letterSpacing: tokens.letter,
                      }}
                    >
                      Report Issue
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(false)}
                      className="w-7 h-7 bg-white flex items-center justify-center text-lg leading-none"
                      style={{ border: tokens.border, borderRadius: tokens.radiusSm }}
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-3 overflow-y-auto text-sm space-y-2.5">
                    <div
                      className="inline-block px-2.5 py-1.5 text-[11px] font-semibold"
                      style={{
                        background: primaryColor,
                        border: tokens.border,
                        borderRadius: tokens.radiusSm,
                        fontFamily: tokens.fontHeader,
                        textTransform: tokens.headerTransform as "none" | "uppercase",
                      }}
                    >
                      Earn ${formatMoney(bountyAmount)} credit
                    </div>
                    <p className="text-[13px] text-gray-600 leading-snug m-0">{welcomeMessage}</p>
                    <div
                      className="border-2 border-dashed border-gray-300 text-center py-3 font-mono text-[11px] uppercase text-gray-500"
                      style={{ borderRadius: tokens.radiusSm }}
                    >
                      📸 Capture &amp; annotate screenshot
                    </div>
                    <FakeField label="Issue type" value="Bug / Something broken" tokens={tokens} color={primaryColor} />
                    <FakeField label="Title" value="Checkout button does nothing…" tokens={tokens} color={primaryColor} />
                    <FakeField label="Your email" value="user@email.com" tokens={tokens} color={primaryColor} />
                    <div
                      className="w-full text-center py-2.5 text-[13px] font-semibold text-white bg-black"
                      style={{
                        border: tokens.border,
                        borderRadius: tokens.radiusSm,
                        fontFamily: tokens.fontHeader,
                        textTransform: tokens.headerTransform as "none" | "uppercase",
                      }}
                    >
                      Submit report
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 font-mono leading-relaxed">
            Click the launcher in the preview to open/close the form. After you hit{" "}
            <strong>Save settings</strong>, this is what loads on your live site via the script tag.
          </p>
        </div>
      </div>
    </div>
  );
}

function ControlBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="brutal-box-sm p-4 bg-white space-y-2">
      <p className="font-mono text-xs uppercase font-bold">{title}</p>
      {children}
    </div>
  );
}

function FakeField({
  label,
  value,
  tokens,
  color,
}: {
  label: string;
  value: string;
  tokens: ReturnType<typeof styleTokens>;
  color: string;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase text-gray-500 mb-1">{label}</p>
      <div
        className="px-2 py-1.5 text-[12px] text-gray-700 bg-white"
        style={{ border: tokens.border, borderRadius: tokens.radiusSm }}
      >
        {value}
      </div>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function styleTokens(style: WidgetStudioValues["style"]) {
  if (style === "soft") {
    return {
      radius: 14,
      radiusSm: 10,
      border: "1px solid rgba(0,0,0,.12)",
      shadow: "0 8px 28px rgba(0,0,0,.18)",
      fontHeader: "system-ui, sans-serif",
      headerTransform: "none" as const,
      letter: "0",
    };
  }
  if (style === "pill") {
    return {
      radius: 999,
      radiusSm: 12,
      border: "none",
      shadow: "0 6px 20px rgba(0,0,0,.2)",
      fontHeader: "system-ui, sans-serif",
      headerTransform: "none" as const,
      letter: "0",
    };
  }
  return {
    radius: 0,
    radiusSm: 0,
    border: "2px solid #000",
    shadow: "4px 4px 0 #000",
    fontHeader: "ui-monospace, monospace",
    headerTransform: "uppercase" as const,
    letter: "0.5px",
  };
}

function normalizeHex(c: string) {
  const t = c.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t;
  if (/^[0-9A-Fa-f]{6}$/.test(t)) return `#${t}`;
  return "#FFE100";
}

function formatMoney(v: string) {
  const n = parseFloat(v);
  if (isNaN(n)) return v;
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}
