/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        synologyPhotosApiBaseUrl: process.env.SYNOLOGY_PHOTOS_API_BASE_URL,
        synologyPhotosUsername: process.env.SYNOLOGY_PHOTOS_USERNAME,
        synologyPhotosPassword: process.env.SYNOLOGY_PHOTOS_PASSWORD,
        slideshowTiming: process.env.SLIDESHOW_TIMING,
        daysInterval: process.env.DAYS_INTERVAL,
        passphraseSharedAlbum: process.env.PASSPHRASE_SHARED_ALBUM,
        useSharedSpace: process.env.USE_SHARED_SPACE,
        minStars: process.env.MIN_STARS,
    },
};

export default nextConfig;
