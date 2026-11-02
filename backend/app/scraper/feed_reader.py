"""
RSS feed reader for stock market news sources.

Reads RSS feeds from top-tier financial news sites focused on stock markets,
extracts article metadata (including images from <enclosure> and <media:content>
tags), and attempts to fetch article text for summarization.

Focused on major headline news only — curated for quality over quantity.
"""

import logging
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urlparse
import feedparser
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

# ── Curated Stock Market RSS Feeds (top-tier sources only) ───────────
RSS_FEEDS = [
    # Indian stock market (primary coverage)
    "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms",
    "https://www.moneycontrol.com/rss/marketreports.xml",
    "https://www.livemint.com/rss/markets",
    # Global stock markets
    "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    "https://feeds.marketwatch.com/marketwatch/topstories/",
]

# ── Headline quality filter keywords ─────────────────────────────────
# Headlines containing these patterns are likely low-quality filler
_SKIP_PATTERNS = [
    re.compile(r"^\d+ things to know", re.IGNORECASE),
    re.compile(r"^sponsored", re.IGNORECASE),
    re.compile(r"^ad:", re.IGNORECASE),
    re.compile(r"^promoted:", re.IGNORECASE),
    re.compile(r"horoscope|astrology|zodiac", re.IGNORECASE),
    re.compile(r"lifestyle|recipe|cricket|bollywood|entertainment", re.IGNORECASE),
    re.compile(r"^watch:|^video:", re.IGNORECASE),
]

# Headlines should contain at least one stock-market-related keyword
_RELEVANCE_KEYWORDS = {
    # Market indices
    "nifty", "sensex", "bse", "nse", "s&p", "dow", "nasdaq", "ftse", "hang seng",
    "nikkei", "dax", "index", "indices",
    # Stock terms
    "stock", "share", "shares", "equity", "market", "markets", "bull", "bear",
    "rally", "crash", "correction", "ipo", "listing", "fpo", "ofs",
    # Financial terms
    "earnings", "profit", "revenue", "dividend", "quarterly", "annual",
    "results", "q1", "q2", "q3", "q4", "fiscal", "eps",
    # Trading & investing
    "buy", "sell", "trade", "trading", "investor", "investors", "fund",
    "mutual fund", "etf", "fii", "dii", "portfolio", "investment",
    # Corporate actions
    "ceo", "merger", "acquisition", "takeover", "board", "bonus", "split",
    "buyback", "stake", "deal", "ipo",
    # Economy & regulation
    "rbi", "fed", "interest rate", "inflation", "gdp", "fiscal", "budget",
    "policy", "sebi", "regulation", "monetary",
    # Banking & finance
    "bank", "banking", "fintech", "credit", "loan", "npa",
    # Commodities (market-moving)
    "crude", "oil", "gold", "silver", "commodity",
    # Crypto (market-moving)
    "bitcoin", "btc", "crypto",
    # General market terms
    "analyst", "forecast", "outlook", "target", "upgrade", "downgrade",
    "sector", "pharma", "it", "auto", "realty", "metal", "fmcg", "midcap",
    "smallcap", "largecap", "bluechip",
}


def _is_relevant_headline(headline: str) -> bool:
    """Check if a headline is relevant to stock markets and not filler content."""
    # Skip very short headlines (likely filler)
    if len(headline) < 25:
        return False

    # Skip known junk patterns
    for pattern in _SKIP_PATTERNS:
        if pattern.search(headline):
            return False

    # Check for at least one relevance keyword
    headline_lower = headline.lower()
    for keyword in _RELEVANCE_KEYWORDS:
        if keyword in headline_lower:
            return True

    # If no keyword matched, skip — this headline is likely off-topic
    return False


@dataclass
class FeedArticle:
    headline: str
    url: str
    source_domain: str
    published_at: Optional[datetime]
    text: str
    image_url: Optional[str] = None
    additional_sources: list[dict] = field(default_factory=list)


def _extract_domain(url: str) -> str:
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    if domain.startswith("www."):
        domain = domain[4:]
    return domain


def _parse_published_date(entry: dict) -> Optional[datetime]:
    for field_name in ("published_parsed", "updated_parsed"):
        time_struct = entry.get(field_name)
        if time_struct:
            try:
                from time import mktime
                return datetime.fromtimestamp(mktime(time_struct), tz=timezone.utc)
            except (ValueError, OverflowError):
                continue
    return None


def _extract_image_url(entry: dict) -> Optional[str]:
    """
    Extract thumbnail/banner image URL from RSS entry.
    Checks <enclosure>, <media:content>, <media:thumbnail>, and inline HTML.
    """
    # 1. Check <enclosure type="image/...">
    for enclosure in entry.get("enclosures", []):
        etype = enclosure.get("type", "")
        if etype.startswith("image/"):
            url = enclosure.get("href") or enclosure.get("url")
            if url:
                return url

    # 2. Check <media:content> or <media:thumbnail>
    for media_key in ("media_content", "media_thumbnail"):
        media_list = entry.get(media_key, [])
        if isinstance(media_list, list):
            for media in media_list:
                url = media.get("url")
                if url and _is_image_url(url):
                    return url

    # 3. Check for image in the summary/description HTML
    summary = entry.get("summary", "")
    if summary:
        soup = BeautifulSoup(summary, "html.parser")
        img = soup.find("img")
        if img and img.get("src"):
            return img["src"]

    return None


def _is_image_url(url: str) -> bool:
    """Quick check if a URL looks like an image."""
    lower = url.lower()
    return any(lower.endswith(ext) or ext + "?" in lower for ext in (".jpg", ".jpeg", ".png", ".webp", ".gif"))


async def fetch_article_text(url: str) -> tuple[str, Optional[str]]:
    """Attempt to fetch and extract readable text and og:image from an article URL."""
    try:
        async with httpx.AsyncClient(
            timeout=15.0,
            follow_redirects=True,
            headers={"User-Agent": "GoFact/2.0 (Financial News Aggregator)"},
        ) as client:
            response = await client.get(url)
            response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # Extract og:image
        og_image = soup.find("meta", property="og:image")
        image_url = og_image["content"] if og_image and og_image.get("content") else None

        # Remove unwanted elements
        for tag in soup.find_all(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        # Try common article body selectors
        article_body = (
            soup.find("article")
            or soup.find(class_="article-body")
            or soup.find(class_="caas-body")  # Yahoo Finance
            or soup.find(class_="content_wrapper")  # Economic Times
            or soup.find(class_="arti-flow")  # Moneycontrol
            or soup.find(id="article-body")
        )

        if article_body:
            text = article_body.get_text(separator=" ", strip=True)
        else:
            # Fallback: get all paragraph text
            paragraphs = soup.find_all("p")
            text = " ".join(p.get_text(strip=True) for p in paragraphs)

        # Limit text length for LLM input
        return text[:5000] if text else "", image_url
    except Exception as e:
        logger.warning(f"Failed to fetch article text from {url}: {e}")
        return "", None


async def read_feeds(since_hours: int = 24) -> list[FeedArticle]:
    """Parse all configured RSS feeds and return relevant stock market articles."""
    articles = []
    
    from datetime import timedelta
    cutoff = datetime.now(timezone.utc) - timedelta(hours=since_hours)

    import asyncio
    
    async def process_feed(feed_url: str) -> list[FeedArticle]:
        feed_articles = []
        try:
            feed = await asyncio.to_thread(feedparser.parse, feed_url)
            if feed.bozo and not feed.entries:
                logger.warning(f"Failed to parse feed: {feed_url}")
                return feed_articles

            for entry in feed.entries:
                url = entry.get("link", "")
                if not url:
                    continue

                headline = entry.get("title", "").strip()
                if not headline:
                    continue

                # ── Quality & relevance filter ──
                if not _is_relevant_headline(headline):
                    continue

                summary = entry.get("summary", "")
                if summary:
                    soup = BeautifulSoup(summary, "html.parser")
                    preview_text = soup.get_text(strip=True)
                else:
                    preview_text = ""

                image_url = _extract_image_url(entry)
                published_at = _parse_published_date(entry)
                
                if published_at and published_at < cutoff:
                    continue

                feed_articles.append(
                    FeedArticle(
                        headline=headline,
                        url=url,
                        source_domain=_extract_domain(url),
                        published_at=published_at,
                        text=preview_text,
                        image_url=image_url,
                    )
                )
        except Exception as e:
            logger.error(f"Error processing feed {feed_url}: {e}")
            
        return feed_articles

    results = await asyncio.gather(*(process_feed(url) for url in RSS_FEEDS))
    for result_list in results:
        articles.extend(result_list)

    logger.info(f"Read {len(articles)} relevant articles from {len(RSS_FEEDS)} feeds")
    return articles
