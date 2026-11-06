import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | GoFact",
  alternates: { canonical: "https://gofact.in/terms-of-service" },
};

export default function TermsOfServicePage() {
  return (
    <div className="static-page">
      <h1>Terms of Service</h1>
      <p>Last updated: November 2026</p>
      <h2>Use of content</h2>
      <p>
        GoFact aggregates and summarizes publicly available news articles. All
        original content belongs to its respective publishers. AI-generated
        summaries are produced by GoFact and are for informational purposes only.
      </p>
      <h2>No financial advice</h2>
      <p>
        Nothing on GoFact constitutes investment, financial, legal, or tax advice.
        Always consult a qualified professional before making any financial decision.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        GoFact is provided &quot;as is&quot; without any warranties. We are not
        liable for any losses arising from your use of this site or reliance on
        content displayed here.
      </p>
      <h2>Changes to these terms</h2>
      <p>
        We may update these terms at any time. Continued use of the site after
        changes constitutes acceptance of the revised terms.
      </p>
    </div>
  );
}

