import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dock from "@/components/Dock";
import BubbleCursor from "@/components/BubbleCursor";
import AnimatedFavicon from "@/components/AnimatedFavicon";

export const metadata: Metadata = {
  title: "by claraexmachina",
  description: "일상과 생각을 기록하는 나만의 공간",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" type="image/gif" href="https://pixelsafari.neocities.org/favicon/animals/cat/cat61.gif" />
        <link rel="preload" href="/fonts/Yeongdeok Sea.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pb-20 md:pb-24">
          {children}
        </main>
        <Footer />
        <Dock />
        <BubbleCursor />
        <AnimatedFavicon />
      </body>
    </html>
  );
}
