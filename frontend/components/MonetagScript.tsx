"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MonetagScript() {
  const pathname = usePathname();

  useEffect(() => {
    // Strictly isolate: ONLY load on movie, verify, and download funnel routes.
    // Never load on homepage or financial articles (reserved for Google AdSense).
    const isFunnelRoute =
      pathname?.startsWith("/verify") ||
      pathname?.startsWith("/download-options") ||
      pathname?.startsWith("/movies");

    if (!isFunnelRoute) return;

    // 1. Inject Monetag MultiTag (Zone 312669)
    if (!document.getElementById("monetag-multitag")) {
      const s = document.createElement("script");
      s.id = "monetag-multitag";
      s.src = "https://quge5.com/88/tag.min.js";
      s.setAttribute("data-zone", "312669");
      s.async = true;
      s.setAttribute("data-cfasync", "false");
      document.head.appendChild(s);
    }

    // 2. Inject Monetag Popunder Tag (Zone 12303444)
    if (!document.getElementById("monetag-popunder")) {
      const p = document.createElement("script");
      p.id = "monetag-popunder";
      p.src = "https://al5sm.com/tag.min.js";
      p.dataset.zone = "12303444";
      p.async = true;
      p.setAttribute("data-cfasync", "false");
      document.head.appendChild(p);
    }
  }, [pathname]);

  return null;
}
