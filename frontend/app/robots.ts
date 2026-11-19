import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Mediapartners-Google",
        disallow: ["/verify/", "/download-options/", "/movies/"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/verify/",
          "/download-options/",
          "/movies/",
        ],
      },
    ],
    sitemap: "https://gofact.in/sitemap.xml",
    host: "https://gofact.in",
  };
}


