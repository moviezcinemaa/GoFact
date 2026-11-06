import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About GoFact",
  description: "Learn about GoFact — AI-powered stock market news aggregator and summarizer for Indian investors.",
  alternates: { canonical: "https://gofact.in/about" },
};

export default function AboutPage() {
  return (
    <div className="static-page">
      <h1>About GoFact</h1>
      <p>
        GoFact is an AI-powered news aggregator focused on Indian and global stock markets.
        We curate articles from leading financial publications and summarize them using
        large language models, so you can stay informed without reading walls of text.
      </p>
      <h2>What we cover</h2>
      <ul>
        <li>Nifty, Sensex, and broader Indian equity markets</li>
        <li>IPOs, FPOs, and primary market events</li>
        <li>Cryptocurrency and digital assets</li>
        <li>Commodities — gold, oil, and agricultural futures</li>
        <li>Global macro and RBI/Fed policy</li>
      </ul>
      <h2>Our sources</h2>
      <p>
        We aggregate from CNBC TV18, Moneycontrol, LiveMint, Economic Times Markets,
        Business Standard, and other SEBI-compliant Indian financial publications.
        Every summary links back to the original source article.
      </p>
      <h2>Disclaimer</h2>
      <p>
        GoFact is a news aggregation service. Nothing on this site constitutes financial
        advice. Please consult a registered investment advisor before making any
        investment decisions.
      </p>
    </div>
  );
}

