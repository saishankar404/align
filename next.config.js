const nextPwa = require("@ducanh2912/next-pwa");

const withPWA = nextPwa.default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  reloadOnOnline: false,
  cacheStartUrl: false,
  customWorkerSrc: "public/sw-custom.js",
  publicExcludes: [
    "!fonts/**/*",
    "!fonts/satoshi_fonts/**/*",
    "!logo_secondary.png",
    "!logo_secondary.svg",
  ],
  extendDefaultRuntimeCaching: true,
  runtimeCaching: [
    {
      urlPattern: /\/_next\/static\/.+\.js$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "next-static-js-assets",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 48,
          maxAgeSeconds: 60 * 60,
        },
      },
    },
    {
      urlPattern: ({ url, sameOrigin }) => sameOrigin && !url.pathname.startsWith("/api/"),
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 24,
          maxAgeSeconds: 60 * 30,
        },
      },
    },
  ],
  workboxOptions: {
    skipWaiting: false,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = withPWA(nextConfig);
