export default function Loading() {
  const skeletonCards = Array.from({ length: 6 });

  return (
    <>
      {/* Page Heading Skeleton */}
      <div
        className="bg-gray-200 rounded-none animate-pulse"
        style={{ width: "360px", height: "30px", marginBottom: "10px" }}
      />
      <div
        className="bg-gray-200 rounded-none animate-pulse"
        style={{
          width: "100%",
          maxWidth: "680px",
          height: "16px",
          marginBottom: "28px",
        }}
      />

      {/* Search Bar Skeleton */}
      <div
        className="bg-gray-200 rounded-none animate-pulse"
        style={{
          width: "100%",
          maxWidth: "480px",
          height: "40px",
          marginBottom: "16px",
        }}
      />

      {/* Category Accordion Skeleton */}
      <div
        className="bg-gray-200 rounded-none animate-pulse"
        style={{ width: "100%", height: "42px", marginBottom: "28px" }}
      />

      {/* Dynamic Grid Skeletons */}
      <div className="news-grid-dynamic">
        {skeletonCards.map((_, idx) => (
          <div
            key={idx}
            className="news-grid-item-dynamic"
            style={{ "--dynamic-span": 2 } as React.CSSProperties}
          >
            <div
              className="news-card"
              style={{ pointerEvents: "none", borderColor: "var(--border-color)" }}
            >
              {/* 16:9 Image Block */}
              <div
                className="bg-gray-200 rounded-none animate-pulse"
                style={{ width: "100%", aspectRatio: "16 / 9" }}
              />

              {/* Card Body */}
              <div className="news-card-body" style={{ padding: "16px" }}>
                {/* Meta Badge */}
                <div
                  className="bg-gray-200 rounded-none animate-pulse"
                  style={{ width: "80px", height: "14px", marginBottom: "12px" }}
                />

                {/* Headline Lines */}
                <div
                  className="bg-gray-200 rounded-none animate-pulse"
                  style={{ width: "95%", height: "18px", marginBottom: "8px" }}
                />
                <div
                  className="bg-gray-200 rounded-none animate-pulse"
                  style={{ width: "70%", height: "18px", marginBottom: "16px" }}
                />

                {/* Summary Preview Lines */}
                <div
                  className="bg-gray-200 rounded-none animate-pulse"
                  style={{ width: "100%", height: "12px", marginBottom: "6px" }}
                />
                <div
                  className="bg-gray-200 rounded-none animate-pulse"
                  style={{ width: "90%", height: "12px", marginBottom: "6px" }}
                />
                <div
                  className="bg-gray-200 rounded-none animate-pulse"
                  style={{ width: "65%", height: "12px", marginBottom: "16px" }}
                />

                {/* Footer Time */}
                <div
                  className="bg-gray-200 rounded-none animate-pulse"
                  style={{ width: "60px", height: "12px" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
