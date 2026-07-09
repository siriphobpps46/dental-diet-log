import type { SVGProps } from "react";

export type MascotPose = "smile" | "wave" | "sleepy";

interface ToothMascotProps extends SVGProps<SVGSVGElement> {
  pose?: MascotPose;
}

const BODY_PATH =
  "M80,12 C110,12 138,34 138,66 C138,92 128,100 122,112 C130,128 128,152 116,166 " +
  "C108,176 98,166 96,140 C95,124 90,118 80,118 C70,118 65,124 64,140 " +
  "C62,166 52,176 44,166 C32,152 30,128 38,112 C32,100 22,92 22,66 C22,34 50,12 80,12 Z";

export function ToothMascot({ pose = "smile", className, ...props }: ToothMascotProps) {
  return (
    <svg
      viewBox="0 0 160 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={
        pose === "wave" ? "มาสคอตฟันโบกมือทักทาย" : pose === "sleepy" ? "มาสคอตฟันง่วงนอน" : "มาสคอตฟันยิ้ม"
      }
      {...props}
    >
      <path d={BODY_PATH} fill="#FFFFFF" stroke="#C4B5FD" strokeWidth="5" strokeLinejoin="round" />
      <ellipse cx="52" cy="40" rx="15" ry="9" fill="white" opacity="0.7" transform="rotate(-25 52 40)" />
      <ellipse cx="46" cy="83" rx="9" ry="5.5" fill="#FBCFE8" opacity="0.85" />
      <ellipse cx="114" cy="83" rx="9" ry="5.5" fill="#FBCFE8" opacity="0.85" />

      {pose === "sleepy" ? (
        <>
          <path d="M53,62 Q60,55 67,62" stroke="#6D28D9" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M93,62 Q100,55 107,62" stroke="#6D28D9" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M66,92 Q80,87 94,92" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" fill="none" />
          <text x="114" y="36" fontSize="15" fill="#C4B5FD" fontFamily="sans-serif" fontWeight={700}>
            z
          </text>
          <text x="127" y="24" fontSize="11" fill="#C4B5FD" fontFamily="sans-serif" fontWeight={700}>
            z
          </text>
        </>
      ) : (
        <>
          <circle cx="61" cy="62" r="7" fill="#5B21B6" />
          <circle cx="99" cy="62" r="7" fill="#5B21B6" />
          <circle cx="58.5" cy="59.5" r="2" fill="white" />
          <circle cx="96.5" cy="59.5" r="2" fill="white" />
          <path d="M62,88 Q80,103 98,88" stroke="#7C3AED" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        </>
      )}

      {pose === "wave" && (
        <>
          <path
            d="M119,97 C136,92 149,76 147,55"
            stroke="#C4B5FD"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M133,48 L140,42 M141,52 L150,48 M136,58 L146,58"
            stroke="#DDD6FE"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
