import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription =
  "Trouvez rapidement une salle libre a l'ETS, puis consultez les horaires complets des cours et des enseignants (session été 2026).";

/** Canonique pour Open Graph ; en prod sur Vercel, le domaine personnalisé vient souvent de VERCEL_PROJECT_PRODUCTION_URL */
const metadataBaseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : null) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "http://localhost:3000";

/** Fond noir plein écran en PWA ; safe areas via CSS + globals.css (standalone) */
export const viewport: Viewport = {
  themeColor: "#000000",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: "ÉTS Hub - Salles libres et horaires ETS",
  description: siteDescription,
  appleWebApp: {
    capable: true,
    title: "ÉTS Hub",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "ÉTS Hub",
    description: siteDescription,
    siteName: "ÉTS Hub",
    locale: "fr_CA",
    type: "website",
    url: "/",
    images: [
      {
        url: "/og-social.png",
        width: 1200,
        height: 630,
        alt: "ÉTS Hub — salles libres et horaires",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ÉTS Hub",
    description: siteDescription,
    images: ["/og-social.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
