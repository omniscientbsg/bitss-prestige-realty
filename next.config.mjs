/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
