import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | GoFact",
  alternates: { canonical: "https://gofact.in/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="static-page">
      <h1>Privacy Policy</h1>
      <p>Last updated: November 2026</p>
      <h2>Information we collect</h2>
      <p>
        GoFact does not collect personally identifiable information unless you
        contact us directly. We use Google Analytics to understand aggregate
        traffic patterns (page views, session duration, referral sources).
      </p>
      <h2>Cookies</h2>
      <p>
        We use cookies set by Google Analytics and Google AdSense. You may
        disable cookies via your browser settings; some features may not function
        correctly as a result.
      </p>
      <h2>Third-party services</h2>
      <p>
        Our site displays advertisements served by Google AdSense. Google may use
        cookies to serve ads based on your prior visits to our site and other
        sites. You may opt out at{" "}
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
          google.com/settings/ads
        </a>.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about this policy? Email{" "}
        <a href="mailto:hello@gofact.in">hello@gofact.in</a>.
      </p>
    </div>
  );
}

