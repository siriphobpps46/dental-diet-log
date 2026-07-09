import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ddd6fe 0%, #a855f7 100%)",
        }}
      >
        <svg width="128" height="144" viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M80,12 C110,12 138,34 138,66 C138,92 128,100 122,112 C130,128 128,152 116,166 C108,176 98,166 96,140 C95,124 90,118 80,118 C70,118 65,124 64,140 C62,166 52,176 44,166 C32,152 30,128 38,112 C32,100 22,92 22,66 C22,34 50,12 80,12 Z"
            fill="#FFFFFF"
            stroke="#C4B5FD"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <ellipse cx="46" cy="83" rx="9" ry="5.5" fill="#FBCFE8" />
          <ellipse cx="114" cy="83" rx="9" ry="5.5" fill="#FBCFE8" />
          <circle cx="61" cy="62" r="8" fill="#5B21B6" />
          <circle cx="99" cy="62" r="8" fill="#5B21B6" />
          <path d="M62,88 Q80,103 98,88" stroke="#7C3AED" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
