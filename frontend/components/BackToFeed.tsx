"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface BackToFeedProps {
  fromParam?: string | null;
  category?: string | null;
}

export default function BackToFeed({ fromParam, category }: BackToFeedProps) {
  const router = useRouter();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (typeof window !== "undefined" && window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  }

  let fallbackHref = "/";
  if (fromParam) {
    const decoded = decodeURIComponent(fromParam);
    fallbackHref = decoded.startsWith("?") ? `/${decoded}` : `/?${decoded}`;
  } else if (category && category !== "All") {
    fallbackHref = `/?category=${encodeURIComponent(category)}`;
  }

  return (
    <Link href={fallbackHref} onClick={handleClick} className="back-link">
      ← Back to feed
    </Link>
  );
}

