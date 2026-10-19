import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WS Moda e Variedades - Frente de Caixa PDV & Gestão",
  description: "Frente de Caixa Inteligente para WS Moda e Variedades com Auto-Alimentação de Catálogo",
  icons: {
    icon: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
