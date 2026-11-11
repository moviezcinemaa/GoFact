export default function MoviesLoading() {
  return (
    <div className="feed-loading-container" style={{ width: "100%" }}>
      {/* Page Heading Skeleton */}
      <div
        className="skeleton-block"
        style={{
          width: "200px",
          height: "30px",
          backgroundColor: "var(--skeleton-from, #e8e6e2)",
          marginBottom: "12px",
          borderRadius: 0,
        }}
      />
      <div
        className="skeleton-block"
        style={{
          width: "350px",
          maxWidth: "100%",
          height: "16px",
          backgroundColor: "var(--skeleton-from, #e8e6e2)",
          marginBottom: "24px",
          borderRadius: 0,
        }}
      />

      {/* 6 Grid Card Skeletons */}
      <div className="news-grid-dynamic">
        {Array.from({ length: 6 }).map((_, idx) => {
          const rowIdx = Math.floor(idx / 3);
          const itemsInThisRow = Math.min(3, 6 - rowIdx * 3);
          let span = 2;
          if (itemsInThisRow === 1) span = 6;
          else if (itemsInThisRow === 2) span = 3;

          return (
            <div
              key={idx}
              className="news-grid-item-dynamic"
              style={{ "--dynamic-span": span } as React.CSSProperties}
            >
              <div
                className="news-card"
                style={{
                  border: "1px solid var(--border-color, #d0d0d0)",
                  background: "var(--bg-card, #ffffff)",
                  borderRadius: 0,
                }}
              >
                <div
                  className="skeleton-block"
                  style={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    backgroundColor: "var(--skeleton-from, #e8e6e2)",
                    borderRadius: 0,
                  }}
                />
                <div style={{ padding: "16px" }}>
                  <div
                    className="skeleton-block"
                    style={{
                      width: "40%",
                      height: "12px",
                      backgroundColor: "var(--skeleton-from, #e8e6e2)",
                      marginBottom: "12px",
                      borderRadius: 0,
                    }}
                  />
                  <div
                    className="skeleton-block"
                    style={{
                      width: "85%",
                      height: "18px",
                      backgroundColor: "var(--skeleton-from, #e8e6e2)",
                      marginBottom: "8px",
                      borderRadius: 0,
                    }}
                  />
                  <div
                    className="skeleton-block"
                    style={{
                      width: "100%",
                      height: "14px",
                      backgroundColor: "var(--skeleton-from, #e8e6e2)",
                      borderRadius: 0,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
