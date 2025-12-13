import getLogger from "@/utils/logger";
import { AppConfig, getConfig } from "@/utils/config";
import {
  Album,
  Albums,
  Item,
  Items,
  browseSharedAlbumItemsWithThumbs,
  filterItemsWithThumbs,
  getFilters,
  getSharedAlbum,
} from "./synologyApi";
import { revalidateTag } from "next/cache";
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache'

export type Photo = {
  cache_key: string;
  name: string;
  time: number;
};

function getMultipleRandom(arr: any[], num: number) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, num);
}

export async function photosSamePeriod(
  token: string,
  sid: string,
  daysInterval: number,
  startYear: number,
  minStars: number
): Promise<Photo[]> {
  "use cache";
  cacheLife('photos');
  cacheTag('photos');
  const config = getConfig();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const year = now.getFullYear();
  const photos: Photo[] = [];
  const promises = [];
  for (var i = startYear; i <= year; i++) {
    const from =
      new Date(i, now.getMonth(), now.getDate()).getTime() / 1000 - (daysInterval * 24 * 60 * 60);
    const to = from + 2 * daysInterval * 24 * 60 * 60;
    promises.push(filterItemsWithThumbs(from, to, [], minStars, token, sid, config));
  }
  const values: PromiseSettledResult<Items>[] = await Promise.allSettled(
    promises
  );
  values.forEach((result: PromiseSettledResult<Items>) => {
    if (result.status === "fulfilled") {
      getMultipleRandom(result.value.data.list, 10).forEach(
        async (item: any) => {
          photos.push({
            cache_key: item.additional.thumbnail.cache_key,
            name: item.filename,
            time: item.time,
          });
        }
      );
    }
  });
  const shuffledPhoto : Photo[] = getMultipleRandom(photos, photos.length)
  return shuffledPhoto;
}

export async function photosSharedAlbum(
  token: string,
  sid: string,
  config: AppConfig
): Promise<Photo[]> {
  "use cache";
  cacheLife('photos');
  cacheTag('photos')
  const albums: Albums = await getSharedAlbum(token, sid, config);
  const album = albums.data.list.find(
    (a: Album) => a.passphrase === config.synology.passphraseSharedAlbum
  );
  const items: Items = await browseSharedAlbumItemsWithThumbs(
    album?.item_count || 0,
    token,
    sid,
    config
  );
  const photos: Photo[] = [];
  items.data.list.forEach(async (item: any) => {
    photos.push({
      cache_key: item.additional.thumbnail.cache_key,
      name: item.filename,
      time: item.time,
    });
  });
  return photos;
}

export async function revalidatePhotos(){
  await revalidateTag("photos");
}

export async function getPhotos(token: string, sid: string): Promise<Photo[]> {
  // const folders = await getFolders(1, "list_parents",auth.synotoken, auth.sid);
  // const subFoldersgetLogger
  let photos: Photo[] = [];
  try {
    const config = getConfig();
    if (config.synology.passphraseSharedAlbum) {
      photos = await photosSharedAlbum(token, sid, config);
    } else {
      const filters = await getFilters(token, sid, config);
      photos = await photosSamePeriod(
        token,
        sid,
        config.slideShow.daysInterval,
        filters.data.time[filters.data.time.length - 1].year,
        config.slideShow.minStars
      );
    }
    getLogger().info(`#${photos.length}`);
  } catch (error) {
    const digest = error instanceof Error && 'digest' in error ? error.digest : 'N/A';
    const message = error instanceof Error ? error.message : String(error);
    getLogger().error(`Error fetching photos: ${message} - DIGEST: ${digest}`);
  }
  return photos;
}
