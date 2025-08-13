import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import Header from "./components/LayoutComponents/Header";
import Footer from "./components/LayoutComponents/Footer";
import ClientSessionProvider from "./components/ClientSessionProvider";
import "./style/globals.css";

export const metadata: Metadata = {
  title: "Online Chat TS",
  description: "Chat com login via NextAuth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex flex-col min-h-screen">
        <ClientSessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClientSessionProvider>
      </body>
    </html>
  );
}
