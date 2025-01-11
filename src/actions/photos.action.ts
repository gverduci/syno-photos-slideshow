import logger from "@/utils/logger";
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
  minStars: number,
  now: Date
): Promise<Photo[]> {
  now.setHours(0, 0, 0, 0);
  const year = now.getFullYear();
  const photos: Photo[] = [];
  const promises = [];
  for (var i = startYear; i <= year; i++) {
    const from =
      new Date(i, now.getMonth(), now.getDate()).getTime() / 1000 - (daysInterval * 24 * 60 * 60);
    const to = from + 2 * daysInterval * 24 * 60 * 60;
    promises.push(filterItemsWithThumbs(from, to, [], minStars, token, sid));
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
  sid: string
): Promise<Photo[]> {
  const albums: Albums = await getSharedAlbum(token, sid);
  const album = albums.data.list.find(
    (a: Album) => a.passphrase === process.env.passphraseSharedAlbum
  );
  const items: Items = await browseSharedAlbumItemsWithThumbs(
    album?.item_count || 0,
    token,
    sid
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

export async function getPhotos(token: string, sid: string, currentTime: Date): Promise<Photo[]> {
  // const folders = await getFolders(1, "list_parents",auth.synotoken, auth.sid);
  // const subFolders = await getFolders(folders.data.list[2].id, "list", auth.synotoken, auth.sid);
  // const itemsWT = await getFolderItemsWithThumbs(subFolders.data.list[1].id, auth.synotoken, auth.sid, auth.cookie);
  // if (revalidate) {
  //   await revalidateTag("photos");
  // }
  const start = performance.now();
  let photos: Photo[] = [];
  if (process.env.passphraseSharedAlbum) {
    photos = await photosSharedAlbum(token, sid);
  } else {
    const filters = await getFilters(token, sid);
    photos = await photosSamePeriod(
      token,
      sid,
      parseInt(process.env.daysInterval || "7", 10),
      filters.data.time[filters.data.time.length - 1].year,
      parseInt(process.env.minStars || "0", 10),
      currentTime
    );
  }
  logger.info(`#${photos.length}`);
  const end = performance.now();
  logger.info(`Execution time: ${end - start} ms`);
  return photos;
}
