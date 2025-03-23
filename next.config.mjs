/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
      dynamicIO: true,
      cacheLife: {
        photos: {
          stale: 3600,
          revalidate: 3600,
          expire: 3600,
        },
      },
    },
  env: {
    slideshowTiming: process.env.SLIDESHOW_TIMING
  },
};

export default nextConfig;
