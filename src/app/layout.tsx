import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dock from "@/components/Dock";
import BubbleCursor from "@/components/BubbleCursor";

export const metadata: Metadata = {
  title: "My Blog ★ 나의 일기장",
  description: "일상과 생각을 기록하는 나만의 공간",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pb-20 md:pb-24">
          {children}
        </main>
        <Footer />
        <Dock />
        <BubbleCursor />
      </body>
    </html>
  );
}
