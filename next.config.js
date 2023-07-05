/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  webpack: (config) => {
    config.externals = [...config.externals, "hnswlib-node"];

    return config;
  },
};

module.exports = nextConfig;
