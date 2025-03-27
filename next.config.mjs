/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
      viewTransition: true,
      dynamicIO: true,
      cacheLife: {
        photos: {
          stale: 3600,
          revalidate: 3600,
          expire: 3600,
        },
      },
    },
  ...(process.env.NODE_ENV !== "development" ? {devIndicators: false} : {}),
  env: {
    slideshowTiming: process.env.SLIDESHOW_TIMING,
    transition: process.env.TRANSITION
  },
};

export default nextConfig;
