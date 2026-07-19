import { ImageResponse } from "next/og";
import { defaultDescription, siteName } from "@/lib/seo";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0f0c",
          color: "#f7f8ef",
          padding: 72,
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ position: "relative", width: 58, height: 58, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 14, border: "1px solid #405060", background: "#101821" }}>
            <div style={{ marginLeft: 5, color: "#f7f9fc", fontSize: 42, lineHeight: 1, fontWeight: 900 }}>D</div>
            <div style={{ position: "absolute", left: 7, top: 4, color: "#0798f2", fontSize: 47, lineHeight: 1, fontWeight: 900 }}>›</div>
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 4 }}>
            {siteName.toUpperCase()}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 86,
              lineHeight: 0.94,
              fontWeight: 900,
            }}
          >
            Web Tasarım ve<br />Video Prodüksiyon
          </div>
          <div style={{ maxWidth: 780, fontSize: 30, lineHeight: 1.3, color: "#c9d0c1" }}>
            {defaultDescription}
          </div>
        </div>
      </div>
    ),
    size
  );
}
