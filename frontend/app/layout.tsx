import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WS Moda - Frente de Caixa PDV & Gestão",
  description: "Frente de Caixa Inteligente para Loja de Roupas com Auto-Alimentação de Catálogo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased selection:bg-rose-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
