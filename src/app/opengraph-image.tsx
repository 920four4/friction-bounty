import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000",
          color: "#FFE100",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: "#FFE100",
              color: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
              border: "4px solid #FFE100",
            }}
          >
            FB
          </div>
          <div style={{ fontSize: 32, color: "#fff", letterSpacing: 2 }}>
            FRICTION BOUNTY
          </div>
        </div>

        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: -2,
            color: "#FFE100",
            textTransform: "uppercase",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Pay your users</span>
          <span style={{ color: "#fff" }}>to find</span>
          <span>your bugs.</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 26,
            color: "#fff",
          }}
        >
          <span>One script tag. Stripe rewards. Done.</span>
          <span style={{ color: "#FFE100" }}>frictionbounty.app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
