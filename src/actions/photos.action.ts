import { LoginResponse } from "@/types/loginResponse";
import {
  Album,
  Albums,
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
}

export async function photosSamePeriod(
  token: string,
  sid: string,
  daysInterval: number,
  startYear: number
): Promise<Photo[]> {
  const now = new Date();
  const oneWeekAgo = new Date();
  const oneWeekAfter = new Date();
  oneWeekAgo.setDate(now.getDate() - daysInterval);
  oneWeekAfter.setDate(now.getDate() + daysInterval);
  const year = now.getFullYear();
  const urls: Photo[] = [];
  const promises = [];
  for (var i = startYear; i < year; i++) {
    const from =
      new Date(i, oneWeekAgo.getMonth(), oneWeekAgo.getDate()).getTime() / 1000;
    const to =
      new Date(i, oneWeekAfter.getMonth(), oneWeekAfter.getDate()).getTime() /
      1000;
    promises.push(
      filterItemsWithThumbs(from, to, [], 0, token, sid)
    );
  }
  const values = await Promise.all(promises);
  values.forEach((value) => {
    value.data.list.forEach(async (item: any) => {
      urls.push({
        cache_key: item.additional.thumbnail.cache_key,
        name: item.filename,
        time: item.time,
      });
    });
  });
  return urls;
}



export async function photosSharedAlbum(
  token: string,
  sid: string,
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
  const urls: Photo[] = [];
  items.data.list.forEach(async (item: any) => {
    urls.push({
      cache_key: item.additional.thumbnail.cache_key,
      name: item.filename,
      time: item.time,
    });
  });
  return urls;
}

export async function getPhotos(token: string, sid: string): Promise<Photo[]> {
  // const folders = await getFolders(1, "list_parents",auth.synotoken, auth.sid);
  // const subFolders = await getFolders(folders.data.list[2].id, "list", auth.synotoken, auth.sid);
  // const itemsWT = await getFolderItemsWithThumbs(subFolders.data.list[1].id, auth.synotoken, auth.sid, auth.cookie);

  let urls: Photo[] = [];
  if (process.env.passphraseSharedAlbum) {
    urls = await photosSharedAlbum(token, sid);
  } else {
    const filters = await getFilters(
      token,
      sid
    );
    urls = await photosSamePeriod(
      token,
      sid,
      parseInt(process.env.daysInterval || "7", 10),
      filters.data.time[filters.data.time.length - 1].year
    );
  }

  return urls;
}
