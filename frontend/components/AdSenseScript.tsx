"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

export default function AdSenseScript() {
  const pathname = usePathname();

  // Strictly isolate Google AdSense from the movie and download funnel routes.
  // This prevents AdSense from scanning or serving ads on verification timers and Telegram links.
  if (
    pathname?.startsWith("/verify") ||
    pathname?.startsWith("/download-options") ||
    pathname?.startsWith("/movies")
  ) {
    return null;
  }

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5744613008467521"
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}
