import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact GoFact",
  description: "Get in touch with the GoFact team for feedback, partnerships, or corrections.",
  alternates: { canonical: "https://gofact.in/contact" },
};

export default function ContactPage() {
  return (
    <div className="static-page">
      <h1>Contact Us</h1>
      <p>
        Have feedback, spotted an error, or want to discuss a partnership?
        We&apos;d love to hear from you.
      </p>
      <h2>Email</h2>
      <p>
        <a href="mailto:hello@gofact.in">hello@gofact.in</a>
      </p>
      <h2>Editorial corrections</h2>
      <p>
        If you believe a summary is factually incorrect, please email us with the
        article link and the correction. We aim to respond within 24 hours.
      </p>
    </div>
  );
}

