import type { Metadata } from "next";
import Header from "./components/LayoutComponents/Header";
import Footer from "./components/LayoutComponents/Footer";
import ClientSessionProvider from "./components/ClientSessionProvider";
import { SocketProvider } from "./context/SocketContext";
import "./style/globals.css";

export const metadata: Metadata = {
  title: "Online Chat TS",
  description: "Chat com login via NextAuth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <ClientSessionProvider>
          <SocketProvider>
            <Header />
            {children}
            <Footer />
          </SocketProvider>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
