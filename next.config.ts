import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Admin CMS forms upload images and documents through server actions.
      bodySizeLimit: "25mb",
    },
  },
  images: {
    localPatterns: [{ pathname: "/media/**", search: "" }],
  },
};

export default withNextIntl(nextConfig);
