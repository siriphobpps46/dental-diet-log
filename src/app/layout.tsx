import type { Metadata, Viewport } from "next";
import { Mali } from "next/font/google";
import "./globals.css";

const mali = Mali({
  variable: "--font-mali",
  subsets: ["latin", "thai"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dental Diet Log",
  description: "บันทึกไดเอทประจำวันสำหรับการรักษาทันตกรรม",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c4b5fd",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${mali.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-gradient-to-b from-violet-50 to-purple-100 font-sans text-purple-950 antialiased">
        {children}
      </body>
    </html>
  );
}
