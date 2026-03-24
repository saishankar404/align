const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  customWorkerSrc: "public/sw-custom.js",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    // Avoid large filesystem cache writes in local dev on constrained disks.
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = withPWA(nextConfig);
