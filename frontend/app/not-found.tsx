import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Document Not Found | GoFact",
  description: "The requested article or intelligence briefing could not be found.",
};

export default function NotFound() {
  const categories = [
    "Stocks",
    "IPO",
    "Economy",
    "Global",
    "Crypto",
    "Commodities",
  ];

  return (
    <div className="static-page">
      <div className="static-doc-header">
        <div className="doc-meta">
          <strong>STATUS CODE</strong> 404 NOT FOUND
        </div>
        <div className="doc-meta">
          <strong>DOCUMENT ID</strong> ERR-404-NF
        </div>
        <div className="doc-meta">
          <strong>INCIDENT CLASSIFICATION</strong> UNRESOLVED URI
        </div>
      </div>

      <div className="static-doc-content">
        <h1
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "12px",
            color: "var(--text-primary)",
            letterSpacing: "-0.5px",
          }}
        >
          Dispatch Not Located
        </h1>

        <p style={{ fontSize: "15px", lineHeight: 1.7, marginBottom: "24px" }}>
          The news item, intelligence briefing, or resource requested could not
          be retrieved. The record may have expired, been updated, or the
          URL address might be mistyped.
        </p>

        <div style={{ marginBottom: "32px" }}>
          <Link
            href="/"
            className="verify-btn verify-btn-active"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              textDecoration: "none",
            }}
          >
            ← Return to Live Feed
          </Link>
        </div>

        <h2>Recommended Market Sectors</h2>
        <p style={{ marginBottom: "16px" }}>
          Explore our AI-summarized coverage across active news categories:
        </p>

        <div className="category-chips" style={{ marginTop: "12px" }}>
          <Link
            href="/"
            className="category-chip"
            style={{ textDecoration: "none" }}
          >
            All News
          </Link>
          {categories.map((cat) => (
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
      </div>
    </div>
  );
}
