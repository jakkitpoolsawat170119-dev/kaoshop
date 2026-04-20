import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.img.susercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.susercontent.com",
      },
      {
        protocol: "https",
        hostname: "cf.shopee.co.th",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
