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
  const now = new Date();
  const oneWeekAgo = new Date();
  const oneWeekAfter = new Date();
  oneWeekAgo.setDate(now.getDate() - daysInterval);
  oneWeekAfter.setDate(now.getDate() + daysInterval);
  const year = now.getFullYear();
  const photos: Photo[] = [];
  const promises = [];
  for (var i = startYear; i <= year; i++) {
    const from =
      new Date(i, oneWeekAgo.getMonth(), oneWeekAgo.getDate()).getTime() / 1000;
    const to =
      new Date(i, oneWeekAfter.getMonth(), oneWeekAfter.getDate()).getTime() /
      1000;
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

export async function getPhotos(token: string, sid: string): Promise<Photo[]> {
  // const folders = await getFolders(1, "list_parents",auth.synotoken, auth.sid);
  // const subFolders = await getFolders(folders.data.list[2].id, "list", auth.synotoken, auth.sid);
  // const itemsWT = await getFolderItemsWithThumbs(subFolders.data.list[1].id, auth.synotoken, auth.sid, auth.cookie);

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
    );
  }
  logger.info(`#${photos.length}`);
  return photos;
}
