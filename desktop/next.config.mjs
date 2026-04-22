/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tauri serves a static bundle; next export for packaging, dev server for tauri dev
  output: process.env.TAURI_ENV_PLATFORM ? "export" : undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
