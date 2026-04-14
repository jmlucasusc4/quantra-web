import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quantra — Quantum Algorithm Playground",
  description: "Interactive quantum algorithm simulations: Grover's search, Shor's factoring, BB84 QKD, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
