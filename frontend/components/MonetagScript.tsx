"use client";

import Script from "next/script";

export default function MonetagScript() {
  return (
    <Script
      id="monetag-popunder"
      src="https://al5sm.com/tag.min.js"
      data-zone="12303444"
      strategy="afterInteractive"
      data-cfasync="false"
    />
  );
}
