/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "lh3.googleusercontent.com" }], // Google profile pics
  },
};

module.exports = nextConfig;
