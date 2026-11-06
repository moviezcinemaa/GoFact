import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { sanityClient, urlFor } from "@/lib/sanity";
import type { MovieNews } from "@/types/sanity";

interface MoviePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const movie: MovieNews = await sanityClient.fetch(
      `*[_type == "movieNews" && slug.current == $slug][0]`,
      { slug }
    );
    if (!movie) return { title: "Movie not found" };

    const description = (movie.summaryPreview || movie.title).slice(0, 160);
    const posterUrl = movie.poster ? urlFor(movie.poster).width(800).url() : "";

    return {
      title: `${movie.title} | GoFact`,
      description,
      alternates: { canonical: `https://gofact.in/movies/${slug}` },
      openGraph: {
        title: movie.title,
        description,
        url: `https://gofact.in/movies/${slug}`,
        images: posterUrl ? [{ url: posterUrl, alt: movie.title }] : [],
      },
    };
  } catch {
    return { title: "Movie | GoFact" };
  }
}

export default async function MovieEntryPage({ params }: MoviePageProps) {
  const { slug } = await params;
  let movie: MovieNews | null = null;
  let relatedMovies: MovieNews[] = [];

  try {
    const query = `*[_type == "movieNews" && slug.current == $slug][0]`;
    const relatedQuery = `*[_type == "movieNews" && slug.current != $slug] | order(_createdAt desc)[0...4] {
      _id, title, slug, poster, "summaryPreview": pt::text(financialNews)
    }`;

    const [movieData, relatedData] = await Promise.all([
      sanityClient.fetch(query, { slug }),
      sanityClient.fetch(relatedQuery, { slug }),
    ]);

    movie = movieData;
    relatedMovies = relatedData || [];
  } catch (err) {
    console.error("Failed to load movie from Sanity", err);
  }

  if (!movie) notFound();

  return (
    <section className="movie-entry">
      <Link href="/?category=Movies" className="back-link">
        ← Back to feed
      </Link>

      <h1 className="movie-entry-title" style={{ fontFamily: "Georgia, serif", fontSize: "28px", margin: "16px 0" }}>
        {movie.title}
      </h1>

      {movie.poster && (
        <div className="article-hero-image" style={{ marginBottom: "24px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlFor(movie.poster).width(800).url()}
            alt={movie.title}
            style={{ width: "100%", maxHeight: "500px", objectFit: "cover" }}
          />
        </div>
      )}

      {movie.financialNews && (
        <div className="article-body" style={{ margin: "24px 0" }}>
          <PortableText value={movie.financialNews} />
        </div>
      )}

      <div className="movie-entry-cta" style={{ margin: "32px 0", textAlign: "center" }}>
        <Link
          href={`/verify/${movie.slug.current}`}
          className="verify-btn verify-btn-active"
          style={{ display: "inline-block", padding: "14px 28px" }}
        >
          Join Telegram Community
        </Link>
      </div>

      {relatedMovies.length > 0 && (
        <div className="related-section">
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
    </section>
  );
}

