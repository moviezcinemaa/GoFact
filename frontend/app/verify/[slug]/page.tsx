"use client";

import { useEffect, useState, useRef, useCallback, use } from "react";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { sanityClient, urlFor } from "@/lib/sanity";
import type { MovieNews } from "@/types/sanity";

interface VerifyPageProps {
  params: Promise<{ slug: string }>;
}

export default function VerifyPage({ params }: VerifyPageProps) {
  const { slug } = use(params);
  const [movie, setMovie] = useState<MovieNews | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<MovieNews[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCounting, setIsCounting] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) return;
    const query = `*[_type == "movieNews" && slug.current == $slug][0]{
      _id, title, slug, youtubeReactions, telegramLink, financialNews
    }`;
    const relatedQuery = `*[_type == "movieNews" && slug.current != $slug] | order(_createdAt desc)[0...4] {
      _id, title, slug, poster, "summaryPreview": pt::text(financialNews)
    }`;

    Promise.all([
      sanityClient.fetch(query, { slug }),
      sanityClient.fetch(relatedQuery, { slug }),
    ]).then(([movieData, relatedData]) => {
      setMovie(movieData);
      setRelatedMovies(relatedData || []);
      setLoading(false);
    });
  }, [slug]);

  const startTimer = useCallback(() => {
    setIsCounting(true);
    timeoutRef.current = setTimeout(() => {
      setIsCounting(false);
      setTimerDone(true);
    }, 10000);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSwipeDown = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="verify-page" style={{ padding: "40px 0", textAlign: "center" }}>
        <div>Loading...</div>
      </section>
    );
  }

  if (!movie) {
    return (
      <section className="verify-page">
        <h1>Not Found</h1>
        <p>This entry does not exist.</p>
        <Link href="/?category=Movies" className="back-link">
          ← Back to feed
        </Link>
      </section>
    );
  }

  return (
    <section className="verify-page" style={{ maxWidth: "760px", margin: "0 auto" }}>
      <h1 className="verify-title" style={{ fontFamily: "Georgia, serif", fontSize: "26px", marginBottom: "20px" }}>
        {movie.title}
      </h1>

      <div className="verify-timer-section" style={{ margin: "24px 0", textAlign: "center" }}>
        {!isCounting && !timerDone && (
          <button type="button" className="verify-btn" onClick={startTimer}>
            Start Verification
          </button>
        )}

        {isCounting && (
          <div className="verify-countdown">
            <div className="numero_counting_wrapper">
              <div className="numero_shape"></div>
            </div>
          </div>
        )}

        {timerDone && (
          <button type="button" className="verify-btn" onClick={handleSwipeDown}>
            Swipe Down
          </button>
        )}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/yt-reactions-placeholder.jpg"
        alt="Reactions placeholder"
        style={{
          width: "100%",
          aspectRatio: "16/9",
          objectFit: "cover",
          marginBottom: "24px",
          border: "1px solid var(--border-color)",
        }}
      />

      {movie.financialNews && (
        <div className="movie-entry-body" style={{ marginTop: "24px", marginBottom: "24px" }}>
          <PortableText value={movie.financialNews} />
        </div>
      )}

      {movie.youtubeReactions && (
        <div className="verify-reactions" style={{ margin: "24px 0" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", marginBottom: "8px" }}>
            Reactions
          </h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {movie.youtubeReactions}
          </p>
        </div>
      )}

      {relatedMovies.length > 0 && (
        <div className="related-section" style={{ marginTop: "32px" }}>
          <h2 className="related-heading">More Movies</h2>
          <div className="news-grid-dynamic">
            {relatedMovies.map((relMovie, idx) => {
              const rowIdx = Math.floor(idx / 3);
              const itemsInThisRow = Math.min(3, relatedMovies.length - rowIdx * 3);
              const span = itemsInThisRow === 1 ? 6 : itemsInThisRow === 2 ? 3 : 2;

              let truncated = relMovie.summaryPreview || "";
              if (truncated.length > 120) {
                truncated = truncated.slice(0, 120).trimEnd() + "...";
              }

              return (
                <div
                  key={relMovie._id}
                  className="news-grid-item-dynamic"
                  style={{ "--dynamic-span": span } as React.CSSProperties}
                >
                  <Link
                    href={`/movies/${relMovie.slug.current}`}
                    className="news-card"
                    style={{ textDecoration: "none" }}
                  >
                    {relMovie.poster ? (
                      <div className="news-card-image">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={urlFor(relMovie.poster).width(800).url()}
                          alt={relMovie.title}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="movie-poster-placeholder">
                        {relMovie.title[0]}
                      </div>
                    )}
                    <div className="news-card-body">
                      <h2 className="news-card-headline" style={{ margin: 0 }}>
                        {relMovie.title}
                      </h2>
                      {truncated && (
                        <p className="news-card-preview">{truncated}</p>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ height: "32px" }} />

      <div className="verify-footer-action">
        {timerDone ? (
          <Link
            href={`/download-options/${movie.slug.current}`}
            className="verify-btn verify-btn-active"
            style={{ width: "100%", display: "block" }}
          >
            Join Telegram
          </Link>
        ) : (
          <button
            type="button"
            className="verify-btn verify-btn-disabled"
            disabled
            style={{ width: "100%" }}
          >
            Wait to Join...
          </button>
        )}
      </div>
    </section>
  );
}

