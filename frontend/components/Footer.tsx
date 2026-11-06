import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-links">
          <Link href="/">Feed</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/disclaimer">Disclaimer</Link>
        </div>
        <p>© {new Date().getFullYear()} GoFact. AI-summarized stock market news.</p>
      </div>
    </footer>
  );
}

