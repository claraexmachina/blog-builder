import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dock from "@/components/Dock";
import BubbleCursor from "@/components/BubbleCursor";
import AnimatedFavicon from "@/components/AnimatedFavicon";
import Oneko from "@/components/Oneko";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://example.com"),
  title: "by claraexmachina",
  description: "always brewing",
  openGraph: {
    title: "by claraexmachina",
    description: "always brewing",
    images: ["/images/OG.png"],
  },
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
        <ThemeProvider>
          <Header />
          <main className="flex-1 pb-20 md:pb-24">
            {children}
          </main>
          <Footer />
          <Dock />
          <BubbleCursor />
          <AnimatedFavicon />
          <Oneko />
        </ThemeProvider>
      </body>
    </html>
  );
}
