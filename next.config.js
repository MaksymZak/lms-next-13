// Хост публичного URL R2 (r2.dev или кастомный домен) добавляем динамически
const r2Host = (() => {
  try {
    return process.env.R2_PUBLIC_URL
      ? new URL(process.env.R2_PUBLIC_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 (STORAGE_DRIVER=r2)
      { protocol: "https", hostname: "**.r2.dev" },
      ...(r2Host ? [{ protocol: "https", hostname: r2Host }] : []),
      // Демо-картинки из seed
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
};

module.exports = nextConfig;
