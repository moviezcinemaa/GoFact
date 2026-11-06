export default function ArticleLoading() {
  return (
    <div className="article-detail">
      {/* Back link placeholder */}
      <div
        className="skeleton-block bg-gray-200 rounded-none animate-pulse"
        style={{ width: "110px", height: "14px", marginBottom: "24px" }}
      />

      {/* Hero Image Skeleton */}
      <div
        className="skeleton-block bg-gray-200 rounded-none animate-pulse"
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          marginBottom: "24px",
        }}
      />

      {/* Meta Row */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div
          className="skeleton-block bg-gray-200 rounded-none animate-pulse"
          style={{ width: "70px", height: "16px" }}
        />
        <div
          className="skeleton-block bg-gray-200 rounded-none animate-pulse"
          style={{ width: "110px", height: "14px" }}
        />
        <div
          className="skeleton-block bg-gray-200 rounded-none animate-pulse"
          style={{ width: "80px", height: "14px" }}
        />
      </div>

      {/* Large Headline Skeleton */}
      <div
        className="skeleton-block bg-gray-200 rounded-none animate-pulse"
        style={{ width: "95%", height: "32px", marginBottom: "10px" }}
      />
      <div
        className="skeleton-block bg-gray-200 rounded-none animate-pulse"
        style={{ width: "70%", height: "32px", marginBottom: "28px" }}
      />

      {/* Article Body Paragraph Skeletons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
        <div
          className="skeleton-block bg-gray-200 rounded-none animate-pulse"
          style={{ width: "100%", height: "15px" }}
        />
        <div
          className="skeleton-block bg-gray-200 rounded-none animate-pulse"
          style={{ width: "98%", height: "15px" }}
        />
        <div
          className="skeleton-block bg-gray-200 rounded-none animate-pulse"
          style={{ width: "92%", height: "15px" }}
        />
        <div
          className="skeleton-block bg-gray-200 rounded-none animate-pulse"
          style={{ width: "65%", height: "15px" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
        <div
          className="skeleton-block bg-gray-200 rounded-none animate-pulse"
          style={{ width: "100%", height: "15px" }}
        />
        <div
          className="skeleton-block bg-gray-200 rounded-none animate-pulse"
          style={{ width: "95%", height: "15px" }}
        />
        <div
          className="skeleton-block bg-gray-200 rounded-none animate-pulse"
          style={{ width: "85%", height: "15px" }}
        />
      </div>
    </div>
  );
}

