import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "名刺管理",
  description: "名刺を撮影してOCRで読み取り、管理できるアプリ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "名刺管理",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/namecard/manifest.json" />
        <link rel="apple-touch-icon" href="/namecard/icons/apple-touch-icon.png" />
      </head>
      <body className="bg-white text-gray-900 font-sans">{children}</body>
    </html>
  );
}
