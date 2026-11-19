"use client";

import Script from "next/script";

export default function MonetagScript() {
  return (
    <>
      {/* Monetag MultiTag (All-in-One: Popunder, Vignette Interstitial, and In-Page Push) */}
      <Script
        id="monetag-multitag"
        src="https://quge5.com/88/tag.min.js"
        data-zone="312669"
        strategy="afterInteractive"
        data-cfasync="false"
      />
    </>
  );
}
