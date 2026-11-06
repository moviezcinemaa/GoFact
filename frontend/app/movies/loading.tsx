export default function MoviesLoading() {
  const skeletons = Array.from({ length: 6 });

  return (
    <section className="movies-feed">
      <div
        className="bg-gray-200 rounded-none animate-pulse"
        style={{ width: "160px", height: "30px", marginBottom: "8px" }}
      />
      <div
        className="bg-gray-200 rounded-none animate-pulse"
        style={{ width: "240px", height: "16px", marginBottom: "32px" }}
      />

      <div className="news-grid-dynamic">
        {skeletons.map((_, idx) => (
          <div
            key={idx}
            className="news-grid-item-dynamic"
            style={{ "--dynamic-span": 2 } as React.CSSProperties}
          >
            <div
              className="news-card"
              style={{ pointerEvents: "none", borderColor: "var(--border-color)" }}
            >
              <div
                className="bg-gray-200 rounded-none animate-pulse"
                style={{ width: "100%", aspectRatio: "16 / 9" }}
              />
              <div className="news-card-body" style={{ padding: "16px" }}>
                <div
                  className="bg-gray-200 rounded-none animate-pulse"
                  style={{ width: "90%", height: "18px", marginBottom: "10px" }}
                />
                <div
                  className="bg-gray-200 rounded-none animate-pulse"
                  style={{ width: "100%", height: "12px", marginBottom: "6px" }}
                />
                <div
                  className="bg-gray-200 rounded-none animate-pulse"
                  style={{ width: "70%", height: "12px" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

