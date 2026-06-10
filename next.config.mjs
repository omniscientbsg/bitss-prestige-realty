/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['puppeteer', 'puppeteer-core'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
