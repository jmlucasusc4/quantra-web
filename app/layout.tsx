import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import { MobileTabNav } from "@/app/components/nav/MobileTabNav";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quantra — Quantum Algorithm Playground",
  description: "Interactive quantum algorithm simulations: Grover's search, Shor's factoring, BB84 QKD, and more.",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1C91HQM1KB"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1C91HQM1KB');
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
