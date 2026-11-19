"use client";

import Script from "next/script";

interface MonetagScriptProps {
  /** Optional Monetag Zone ID for In-Page Push / Vignette / Popunder */
  zoneId?: string;
  /** Optional custom script URL provided by Monetag */
  src?: string;
}

/**
 * Component to load Monetag monetization tags specifically on
 * high-converting funnel pages (like /verify and /download-options).
 */
export default function MonetagScript({ zoneId, src }: MonetagScriptProps) {
  // If a custom script source is provided via props or env
  const scriptSrc = src || process.env.NEXT_PUBLIC_MONETAG_SCRIPT_URL;
  const currentZone = zoneId || process.env.NEXT_PUBLIC_MONETAG_ZONE_ID;

  if (!scriptSrc && !currentZone) {
    // Renders a placeholder comment when not yet configured
    return null;
  }

  return (
    <>
      {scriptSrc && (
        <Script
          src={scriptSrc}
          strategy="afterInteractive"
          data-cfasync="false"
          {...(currentZone ? { "data-zone": currentZone } : {})}
        />
      )}
    </>
  );
}
