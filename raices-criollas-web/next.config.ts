import type { NextConfig } from "next";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryHostname = process.env.CLOUDINARY_HOSTNAME || "res.cloudinary.com";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: cloudinaryHostname,
        pathname: `/${cloudName}/**`,
      },
    ],
  },
};

export default nextConfig;
