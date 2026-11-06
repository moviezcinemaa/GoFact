"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="site-title">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.jpg" alt="GoFact Logo" className="site-logo" />
          <span>GoFact</span>
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle navigation"
        >
          {navOpen ? "Close" : "Menu"}
        </button>

        <nav className={`site-nav${navOpen ? " open" : ""}`}>
          <Link
            href="/"
            className={pathname === "/" ? "active" : ""}
            onClick={() => setNavOpen(false)}
          >
            Feed
          </Link>
          <Link
            href="/about"
            className={pathname === "/about" ? "active" : ""}
            onClick={() => setNavOpen(false)}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={pathname === "/contact" ? "active" : ""}
            onClick={() => setNavOpen(false)}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}

