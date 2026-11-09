import type { Metadata } from "next";
import "./globals.css";
import { OrganizationJsonLd } from "@/components/JsonLd";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { CompareProvider } from "@/lib/compare/CompareContext";

export const metadata: Metadata = {
  title: {
    default: "PronaX | Prona që kërkon. Shtëpia që meriton. — Kosovë",
    template: "%s | PronaX Kosovë",
  },
  description:
    "Tregu kryesor i pasurive të paluajtshme në Republikën e Kosovës. Gjej banesa, shtëpi, troje dhe lokale afariste në të gjitha 38 komunat e Kosovës. Publiko me tarifë fikse 7.00 € për 30 ditë.",
  keywords: [
    "PronaX", "prona ne kosove", "patundshmeri prishtine",
    "banesa ne shitje kosove", "shtepi ne shitje prizren",
    "qira prishtine", "real estate kosovo", "imobiliare kosove",
    "tregu i pronave kosove", "agjenci patundshmerie",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://pronax-ks.com"),
  openGraph: {
    title: "PronaX | Prona që kërkon. Shtëpia që meriton.",
    description: "Tregu modern dhe i sigurt i patundshmërive në të gjithë Kosovën. 800+ prona aktive.",
    url: "https://pronax-ks.com",
    siteName: "PronaX Kosovë",
    locale: "sq_AL",
    type: "website",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "PronaX — Tregu i Pronave në Kosovë" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PronaX Kosovë — Tregu i Pronave",
    description: "Gjej shtëpinë, banesën apo investimin tënd në Kosovë.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
  themeColor: "#0B192C",
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sq" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('pronax-theme');
                if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                if (t === 'dark') document.documentElement.classList.add('dark');
              } catch(e) {}
              if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        <ThemeProvider>
          <CompareProvider>
            <OrganizationJsonLd />
            {children}
          </CompareProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
