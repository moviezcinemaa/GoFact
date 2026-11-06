"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // Complete progress bar when route transition finishes
  useEffect(() => {
    if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept link clicks to start progress bar instantly
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      try {
        const targetUrl = new URL(href, window.location.href);
        if (targetUrl.origin === window.location.origin) {
          const currentFull = window.location.pathname + window.location.search;
          const targetFull = targetUrl.pathname + targetUrl.search;
          if (currentFull !== targetFull) {
            setVisible(true);
            setProgress(35);
            setTimeout(() => {
              setProgress((prev) => (prev === 35 ? 75 : prev));
            }, 80);
          }
        }
      } catch {
        // Ignore malformed URLs
      }
    };

    document.addEventListener("click", handleDocumentClick, { passive: true });
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: "2px",
        backgroundColor: "#000000",
        boxShadow: "none",
        zIndex: 99999,
        transition:
          progress === 100
            ? "width 100ms ease, opacity 150ms ease"
            : "width 180ms cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: progress === 100 ? 0 : 1,
        pointerEvents: "none",
        borderRadius: 0,
      }}
    />
  );
}

