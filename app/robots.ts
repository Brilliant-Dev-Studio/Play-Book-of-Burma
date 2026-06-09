import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/library", "/membership", "/watch-all", "/login"],
        disallow: ["/admin/", "/user-portal/", "/forgot-password/", "/change-password/", "/api/"],
      },
    ],
    sitemap: "https://playbookofburma.com/sitemap.xml",
  };
}
