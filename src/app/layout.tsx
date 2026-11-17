import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lughati — Belajar Bahasa Arab dengan AI",
  description: "Platform pembelajaran maharah kalam untuk siswa MTs. Belajar kosakata, berlatih percakapan, dan berbicara bahasa Arab bersama AI.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
