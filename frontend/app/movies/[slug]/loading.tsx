export default function MovieDetailLoading() {
  return (
    <div className="article-detail" style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
      {/* Back button skeleton */}
      <div
        className="skeleton-block"
        style={{
          width: "120px",
          height: "14px",
          backgroundColor: "var(--skeleton-from, #e8e6e2)",
          marginBottom: "24px",
          borderRadius: 0,
        }}
      />

      {/* Poster Skeleton */}
      <div
        className="skeleton-block"
        style={{
          width: "100%",
          maxHeight: "500px",
          aspectRatio: "16 / 9",
          backgroundColor: "var(--skeleton-from, #e8e6e2)",
          marginBottom: "24px",
          borderRadius: 0,
        }}
      />

      {/* Headline Skeleton */}
      <div
        className="skeleton-block"
        style={{
          width: "90%",
          height: "32px",
          backgroundColor: "var(--skeleton-from, #e8e6e2)",
          marginBottom: "12px",
          borderRadius: 0,
        }}
      />
      <div
        className="skeleton-block"
        style={{
          width: "60%",
          height: "32px",
          backgroundColor: "var(--skeleton-from, #e8e6e2)",
          marginBottom: "24px",
          borderRadius: 0,
        }}
      />

      {/* Body lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div
          className="skeleton-block"
          style={{
            width: "100%",
            height: "16px",
            backgroundColor: "var(--skeleton-from, #e8e6e2)",
            borderRadius: 0,
          }}
        />
        <div
          className="skeleton-block"
          style={{
            width: "96%",
            height: "16px",
            backgroundColor: "var(--skeleton-from, #e8e6e2)",
            borderRadius: 0,
          }}
        />
        <div
          className="skeleton-block"
          style={{
            width: "75%",
            height: "16px",
            backgroundColor: "var(--skeleton-from, #e8e6e2)",
            borderRadius: 0,
          }}
        />
      </div>
    </div>
  );
}

