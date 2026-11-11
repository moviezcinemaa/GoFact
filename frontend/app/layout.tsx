import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
import TopLoader from "@/components/TopLoader";

export const metadata: Metadata = {
  metadataBase: new URL("https://gofact.in"),
  title: {
    default: "GoFact — AI-Summarized Stock Market News",
    template: "%s | GoFact",
  },
  description:
    "Real-time AI-summarized stock market news. IPO, Nifty, Sensex, crypto, commodities — curated daily.",
  icons: {
    icon: [
      { url: "/logo.webp", type: "image/webp" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/logo.webp",
    apple: "/logo.png",
  },
  other: {
    "google-adsense-account": "ca-pub-5744613008467521",
  },
  openGraph: {
    siteName: "GoFact",
    locale: "en_IN",
    type: "website",
    images: [{ url: "https://gofact.in/favicon.jpg", alt: "GoFact Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@gofact_in",
    images: ["https://gofact.in/favicon.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://gofact-backend.onrender.com" />
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              const kill = () => {
                const b = document.getElementById('netlify-badge') || document.querySelector('[data-netlify-badge]') || document.querySelector('.netlify-badge');
                if (b) b.remove();
              };
              kill();
              if (typeof MutationObserver !== 'undefined') {
                new MutationObserver(kill).observe(document.documentElement, { childList: true, subtree: true });
              }
            })();`,
          }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        <div className="site-wrapper">
          <Header />
          <main className="site-main">{children}</main>
          <Footer />
        </div>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5744613008467521"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-CWG18W9HGQ"
          strategy="lazyOnload"
        />
        <Script id="ga-init" strategy="lazyOnload">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-CWG18W9HGQ');`}
        </Script>
      </body>
    </html>
  );
}
