import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import { MobileTabNav } from "@/app/components/nav/MobileTabNav";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quantra — Quantum Security Simulations",
  description: "Hands-on quantum computing simulations for security engineers and enterprise teams. Learn CRYSTALS-Kyber, BB84 QKD, Shor's algorithm, and NIST PQC standards — all in your browser. No install required.",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "Quantra — Quantum Security Simulations",
    description: "Browser-based quantum simulations for security engineers. CRYSTALS-Kyber, Shor's algorithm, BB84 QKD — NIST FIPS 203/204 aligned.",
    url: "https://quantra.space",
    siteName: "Quantra",
    images: [{ url: "https://quantra.space/api/og", width: 1200, height: 630, alt: "Quantra Quantum Security Simulations" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quantra — Quantum Security Simulations",
    description: "Browser-based quantum simulations. No install. NIST PQC aligned.",
    images: ["https://quantra.space/api/og"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NSLJHSHC3F"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NSLJHSHC3F');
          `}
        </Script>
      </head>
      <body className="min-h-full">
        <AuthProvider>
          {children}
          <MobileTabNav />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
