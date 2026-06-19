import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "../components/app-shell";

import "./globals.css";

export const metadata: Metadata = {
  title: "Contae MVP",
  description:
    "Web leve da IA Financeira Coletiva para revisar espacos, despesas, saldos e acertos."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
