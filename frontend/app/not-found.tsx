import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Dispatch Not Located | GoFact",
  description:
    "The requested financial article, intelligence briefing, or archived record could not be found.",
};

const CATEGORIES = [
  "Stocks",
  "IPO",
  "Economy",
  "Global",
  "Crypto",
  "Commodities",
];

export default function NotFound() {
  return (
    <div className="not-found-page">
      {/* Classified Header */}
      <div className="not-found-header">
        <div className="not-found-header-item">
          <strong>Status Code</strong>
          <span>404 Not Found</span>
        </div>
        <div className="not-found-header-item">
          <strong>Document ID</strong>
          <span>ERR-404-NF</span>
        </div>
        <div className="not-found-header-item">
          <strong>Classification</strong>
          <span>Unindexed Dispatch</span>
        </div>
        <div className="not-found-header-item">
          <strong>Verification Protocol</strong>
          <span>Active Archive Scan</span>
        </div>
        <div className="not-found-header-item">
          <strong>System Integrity</strong>
          <span>Monitored &amp; Online</span>
        </div>
      </div>

      {/* Main Full-Length Dispatch Body */}
      <div className="not-found-body">
        <div className="not-found-status-tag">
          <span>●</span> Archive Notice // Unresolved Address
        </div>

        <h1 className="not-found-title">404 — Dispatch Not Located</h1>

        <p className="not-found-lead">
          The requested financial article, intelligence briefing, or archived
          record could not be located in active indexes. The dispatch may have
          been retired, updated, reclassified, or the URL address may be
          mistyped.
        </p>

        {/* Quick Search */}
        <form
          action="/"
          method="GET"
          className="search-bar"
          style={{ maxWidth: "580px", marginBottom: "32px" }}
        >
          <input
            type="text"
            name="q"
            className="search-input"
            placeholder="Search companies, tickers, or financial topics..."
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        {/* Golden Ratio Action Controls */}
        <div className="not-found-actions">
          <Link href="/" className="not-found-action-btn">
            ← Return to Live Feed
          </Link>
          <Link href="/about" className="not-found-secondary-btn">
            About Our Methodology
          </Link>
        </div>

        {/* Market Sectors */}
        <h2 className="not-found-section-title">Active Market Sectors</h2>
        <p className="not-found-section-desc">
          Jump directly to distilled, noise-free intelligence across active
          financial coverage:
        </p>

        <div className="not-found-chips">
          <Link href="/" className="not-found-chip">
            All News
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/?category=${encodeURIComponent(cat)}`}
              className="not-found-chip"
            >
              {cat}
            </Link>
          ))}
          <Link href="/movies" className="not-found-chip">
            Movies
          </Link>
        </div>

        {/* Footer Navigation Index */}
        <div className="not-found-footer-links">
          <Link href="/" className="not-found-footer-link">
            Live Feed
          </Link>
          <Link href="/about" className="not-found-footer-link">
            About GoFact
          </Link>
          <Link href="/contact" className="not-found-footer-link">
            Contact Desk
          </Link>
          <Link href="/disclaimer" className="not-found-footer-link">
            Financial Disclaimer
          </Link>
          <Link href="/privacy-policy" className="not-found-footer-link">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="not-found-footer-link">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
