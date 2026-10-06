import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZatsuNote — AI自動タグ付けノートアプリ",
  description:
    "思考を殴り書きするだけで、AIが自動でタイトル補正・要約・タグ付けを行って整理してくれるモダンなノートアプリ。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full overflow-hidden bg-dark-bg text-text-primary">
        {children}
      </body>
    </html>
  );
}
