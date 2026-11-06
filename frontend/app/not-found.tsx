import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Document Not Found | GoFact",
  description:
    "The requested article or intelligence briefing could not be found.",
  alternates: { canonical: "https://gofact.in" },
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
    <div className="static-page">
      <div className="static-doc-header">
        <div className="doc-meta">
          <strong>DOCUMENT ID</strong> ERR-404-NF
        </div>
        <div className="doc-meta">
          <strong>STATUS</strong> 404 NOT FOUND
        </div>
        <div className="doc-meta">
          <strong>CLASSIFICATION</strong> UNRESOLVED URI
        </div>
      </div>

      <div className="static-doc-content">
        <p>
          The requested article, market report, or intelligence briefing could
          not be located in our active indexes. The record may have expired,
          been updated, or the destination address may be mistyped.
        </p>

        <div style={{ marginTop: "24px", marginBottom: "32px" }}>
          <Link href="/" className="btn-golden-return">
            ← Return to Live Feed
          </Link>
        </div>

        <h2>Search Market Intelligence</h2>
        <form
          action="/"
          method="GET"
          className="search-bar"
          style={{ maxWidth: "480px", marginBottom: "28px" }}
        >
          <input
            type="text"
            name="q"
            className="search-input"
            placeholder="Search companies, tickers, or topics..."
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        <h2>Active Coverage Sectors</h2>
        <p>Explore our AI-summarized coverage across active news categories:</p>

        <div
          className="category-chips"
          style={{ marginTop: "12px", marginBottom: "32px" }}
        >
          <Link
            href="/"
            className="category-chip"
            style={{ textDecoration: "none" }}
          >
            All News
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/?category=${encodeURIComponent(cat)}`}
              className="category-chip"
              style={{ textDecoration: "none" }}
            >
              {cat}
            </Link>
          ))}
          <Link
            href="/movies"
            className="category-chip"
            style={{ textDecoration: "none" }}
          >
            Movies
          </Link>
        </div>

        <h2>Index Navigation</h2>
        <ul>
          <li>
            <Link href="/">Live News Feed</Link> — Real-time market stream
          </li>
          <li>
            <Link href="/about">About GoFact</Link> — Methodology &amp; 17-model
            AI chain
          </li>
          <li>
            <Link href="/contact">Contact Desk</Link> — Inquiries &amp; content
            removal
          </li>
          <li>
            <Link href="/disclaimer">Disclaimer</Link> — Financial disclaimer
            &amp; risk notice
          </li>
        </ul>
      </div>
    </div>
  );
}
