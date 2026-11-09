import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { sanityClient, urlFor } from "@/lib/sanity";
import type { MovieNews } from "@/types/sanity";

export const metadata: Metadata = {
  title: "Movies | GoFact",
  description: "Entertainment and movie news summaries.",
  alternates: { canonical: "https://gofact.in/movies" },
};

const QUERY = `*[_type == "movieNews"] | order(_createdAt desc) {
  _id, title, slug, poster, telegramLink, "summaryPreview": pt::text(financialNews)
}`;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MoviesFeedPage() {
  let movies: MovieNews[] = [];
  try {
    movies = await sanityClient.fetch(QUERY);
  } catch (err) {
    console.error("Failed to fetch movies from Sanity", err);
  }

  if (!movies || movies.length === 0) {
    return (
      <section className="movies-feed">
        <h1 className="page-heading">Movies</h1>
        <p className="empty-state">No entries yet.</p>
      </section>
    );
  }

  return (
    <section className="movies-feed">
      <h1 className="page-heading">Movies</h1>
      <p className="page-subheading">Entertainment & movie insights</p>

      <div className="news-grid-dynamic">
        {movies.map((movie, idx) => {
          const rowIdx = Math.floor(idx / 3);
          const itemsInThisRow = Math.min(3, movies.length - rowIdx * 3);
          const span = itemsInThisRow === 1 ? 6 : itemsInThisRow === 2 ? 3 : 2;

          let truncated = movie.summaryPreview || "";
          if (truncated.length > 120) {
            truncated = truncated.slice(0, 120).trimEnd() + "...";
          }

          return (
            <div
              key={movie._id}
              className="news-grid-item-dynamic"
              style={{ "--dynamic-span": span } as React.CSSProperties}
            >
              <Link
                href={`/movies/${movie.slug.current}`}
                className="news-card"
                style={{ textDecoration: "none" }}
              >
                {movie.poster ? (
                  <div className="news-card-image" style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
                    <Image
                      src={urlFor(movie.poster).width(600).url()}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 600px) 380px, (max-width: 1024px) 360px, 340px"
                      style={{ objectFit: "cover" }}
                      loading={idx === 0 ? undefined : "lazy"}
                      priority={idx === 0}
                      quality={70}
                    />
                  </div>
                ) : (
                  <div className="movie-poster-placeholder">
                    {movie.title[0]}
                  </div>
                )}
                <div className="news-card-body">
                  <h2 className="news-card-headline" style={{ margin: 0 }}>
                    {movie.title}
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
    </section>
  );
}

