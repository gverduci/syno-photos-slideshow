import { LoginResponse } from "@/types/loginResponse";
import {
  Album,
  Albums,
  Items,
  browseSharedAlbumItemsWithThumbs,
  filterItemsWithThumbs,
  getSharedAlbum,
} from "./synologyApi";

export async function photosSamePeriod(
  auth: LoginResponse,
  daysInterval: number,
  startYear: number
): Promise<string[]> {
  const now = new Date();
  const oneWeekAgo = new Date();
  const oneWeekAfter = new Date();
  oneWeekAgo.setDate(now.getDate() - daysInterval);
  oneWeekAfter.setDate(now.getDate() + daysInterval);
  const year = now.getFullYear();
  const urls: string[] = [];
  const promises = [];
  for (var i = startYear; i < year; i++) {
    const from =
      new Date(i, oneWeekAgo.getMonth(), oneWeekAgo.getDate()).getTime() / 1000;
    const to =
      new Date(i, oneWeekAfter.getMonth(), oneWeekAfter.getDate()).getTime() /
      1000;
    promises.push(
      filterItemsWithThumbs(from, to, [], 0, auth.synotoken, auth.sid)
    );
  }
  const values = await Promise.all(promises);
  values.forEach((value) => {
    value.data.list.forEach(async (item: any) => {
      urls.push(item.additional.thumbnail.cache_key);
    });
  });
  return urls;
}

export async function photosSharedAlbum(
  auth: LoginResponse
): Promise<string[]> {
  const albums: Albums = await getSharedAlbum(auth.synotoken, auth.sid);
  const album = albums.data.list.find(
    (a: Album) => a.passphrase === process.env.passphraseSharedAlbum
  );
  const items: Items = await browseSharedAlbumItemsWithThumbs(
    album?.item_count || 0,
    auth.synotoken,
    auth.sid
  );
  const urls: string[] = [];
  items.data.list.forEach(async (item: any) => {
    urls.push(item.additional.thumbnail.cache_key);
  });
  return urls;
}
