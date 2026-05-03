import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/og-social.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=86400, must-revalidate",
          },
        ],
      },
      {
        source: "/og-loupe.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=86400, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
