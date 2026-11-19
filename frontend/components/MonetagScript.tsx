"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

export default function MonetagScript() {
  const pathname = usePathname();

  // ONLY load Monetag on the movie, verify, and download funnel routes.
  // Never load on the homepage or financial articles (reserved for Google AdSense).
  const isFunnelRoute =
    pathname?.startsWith("/verify") ||
    pathname?.startsWith("/download-options") ||
    pathname?.startsWith("/movies");

  if (!isFunnelRoute) {
    return null;
  }

  return (
    <Script
      id="monetag-multitag"
      src="https://quge5.com/88/tag.min.js"
      data-zone="312669"
      strategy="afterInteractive"
      data-cfasync="false"
    />
  );
}
