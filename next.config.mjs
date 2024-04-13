/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        synologyPhotosApiBaseUrl: process.env.SYNOLOGY_PHOTOS_API_BASE_URL,
        synologyPhotosUsername: process.env.SYNOLOGY_PHOTOS_USERNAME,
        synologyPhotosPassword: process.env.SYNOLOGY_PHOTOS_PASSWORD,
        slideshowTiming: process.env.SLIDESHOW_TIMING,
        passphraseSharedAlbum: process.env.PASSPHRASE_SHARED_ALBUM,
        useSharedSpace: process.env.USE_SHARED_SPACE === "true",
    },
};

export default nextConfig;
