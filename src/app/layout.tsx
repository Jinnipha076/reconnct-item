import type { Metadata } from "next";
import { Sarabun, Prompt } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reunite — ฟีดของหาย / พบของรอบตัวคุณ",
  description: "ประกาศของหายและพบของในชุมชนที่ตรวจสอบได้ พร้อมระบบยืนยันตัวตนและสถานะเคสที่โปร่งใส",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${sarabun.variable} ${prompt.variable}`}>
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
