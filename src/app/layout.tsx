import type { Metadata } from "next";
import Header from "./components/LayoutComponents/Header";
import Footer from "./components/LayoutComponents/Footer";
import "./style/globals.css";

export const metadata: Metadata = {
  title: "Meu App",
  description: "Exemplo com layout fixo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
