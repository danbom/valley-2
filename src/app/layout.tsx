import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valley - 농장 경영 시뮬레이션",
  description: "스타듀밸리 스타일의 농장 경영 시뮬레이션 게임",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-gray-900">
        {children}
      </body>
    </html>
  );
}
