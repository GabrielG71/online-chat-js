// app/layout.tsx
import type { Metadata } from "next";
import "./style/globals.css";

export const metadata: Metadata = {
  title: "Chat Interativo",
  description: "Um chat simples em Next.js + TypeScript",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
