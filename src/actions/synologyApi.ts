"use server"
import { getBrowseSharedAlbumItemUrl, getBrowseSharedAlbumUrl, getCgiUrl, getFilterItemsUrl, getFiltersUrl, getItemThumbnailUrl } from "@/utils/utils";

const nextRevalidate = { next: { revalidate: 3600 } }

/**
 * Check fetch (http) error
 * @param res 
 */
async function checkFetchResponseErrors(res: Response){
  if (!res.ok) {
    throw new Error(`Failed to fetch data. Status: ${res.status} ${res.statusText}`)
  }
}

/**
 * this function throw an exception when Synology return an error code
 * @param res response to parse
 * @returns the parsed response
 */
async function getJsonResponse<T>(res: Response) : Promise<T>{
  const contentType = res.headers.get("content-type");
  const contentTypeJson = contentType?.includes('json');

  if (res.ok && contentTypeJson) {
      const value = await res.json();
      if (value.error){
        throw new Error(`API error. Status: ${res.status} ${res.statusText} ${JSON.stringify(value)}`)
      }
      return value;
  }

  throw new Error("Unsupported response");
}

/**
 * this function throw an exception when Synology return an error code
 * @param res response to parse
 * @returns the parsed response
 */
async function getArrayBufferResponse(res: Response) : Promise<globalThis.ArrayBuffer>{
  const contentType = res.headers.get("content-type");
  const contentTypeJson = contentType?.includes('json');
  const contentTypeImage = contentType?.includes('image'); // "image/jpeg; charset=UTF-8"

  if (res.ok && contentTypeJson) {
      const jsonValue = await res.json();
      if (jsonValue.error){
        throw new Error(`API error. Status: ${res.status} ${res.statusText} ${JSON.stringify(jsonValue)}`)
      }
      throw new Error("Unsupported response: strange error");
  }

  if (res.ok && contentTypeImage){
    return res.arrayBuffer();
  }

  throw new Error("Unsupported response");
}

export type Thumbnail = {
  cache_key: string, // "6005_1705883728",
  m: string, // "ready",
  preview: string, // "broken",
  sm: string, // "ready",
  unit_id: number, // 6005,
  xl: string, // "ready",
};

export type Resolution = {
  width: number, // 3125,
  height: number, // 2084,
};

export type Album = {
  additional: {
    flex_section: number[], // [ 101, ],
    provider_count: number, // 1,
    sharing_info: {
      enable_password: boolean, // false,
      expiration: number, // 0,
      is_expired: boolean, // false,
      mtime: number, // 1710016773,
      owner: {
        id: number, // 5,
        name: string, // "<user>",
      },
      passphrase: string, // "<passphrase>",
      permission: unknown[],
      privacy_type: string, // "public-view",
      sharing_link: string, // "http://<host>/photo/mo/sharing/<passphrase>",
      type: string, // "album",
    },
    thumbnail: Thumbnail,
  },
  cant_migrate_condition: {
  },
  condition: {
  },
  create_time: number, // 1705877481,
  end_time: number, // 1703453187,
  freeze_album: boolean, // false,
  id: number, // 2,
  item_count: number, // 101,
  name: string, // "PhotoAlbum",
  owner_user_id: number, // 5,
  passphrase: string, // "<passphrase>",
  shared: boolean, // true,
  sort_by: string, // "default",
  sort_direction: string, // "default",
  start_time: number, // 1641124724,
  temporary_shared: boolean, // false,
  type: string, // "normal",
  version: number, // 105530,
}

export type Albums = {
  data: {
    list:Album[]
  };
}

/**
 * this function uses the passphrase given in the .env vaiable PASSPHRASE_SHARED_ALBUM
 * 
 * @param token the token returned by the login (synotoken)
 * @param sid the sid returned by the login
 * @returns a shared album
 */
export async function getSharedAlbum(token: string, sid: string): Promise<Albums> {
  const url = getBrowseSharedAlbumUrl(token, sid);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...nextRevalidate
  })
  
  checkFetchResponseErrors(res);

  return getJsonResponse<Albums>(res);
}


export type Item = {
  id: number, // 24251,
  filename: string, // "DSCF1446_01.jpg",
  filesize: number, // 3749109,
  time: number, // 1641124724,
  indexed_time: number, // 1711229010731,
  owner_user_id: number, // 0,
  folder_id: number, // 787,
  type: string, // "photo",
  additional: {
    resolution: Resolution,
    orientation: number, // 1,
    orientation_original: number, // 1,
    thumbnail: Thumbnail,
    provider_user_id: number, // 5,
  },
}

export type Items = {
  data: {
    list: Item[]
  };
}

export type Location = {
  children: Location[];
  id: number;
  level: number;
  name: string;
}

export type ItemType = {
  id: number;
  name: string;
}

export type TimeFilter = {
  year: number;
}

export type Filters = {
  data: {
    aperture: [];
    camera: [];
    exposure_time_group: [];
    flash: [];
    focal_length_group: [];
    folder_filter: [];
    general_tag: [],
    geocoding:[],
    iso: [],
    item_type: ItemType[]
    lens: [],
    person: [],
    rating: number[],
    time: TimeFilter[]
  };
}


/**
 * 
 * @param itemCount number of items in the album
 * @param token the token returned by the login (synotoken)
 * @param sid the sid returned by the login
 * @returns items 
 */
export async function browseSharedAlbumItemsWithThumbs(itemCount:number, token: string, sid: string) : Promise<Items> {
  const url = getBrowseSharedAlbumItemUrl(0, itemCount, token, sid);
  const res = await fetch(url, nextRevalidate);

  checkFetchResponseErrors(res);

  return getJsonResponse<Items>(res);
}

/**
 * 
 * @param url api url
 * @returns the base64 src 
 */
export async function getItemThumbnailByUrl(url: string) : Promise<string> {
  const res = await fetch(url, { cache: 'no-store' })

  checkFetchResponseErrors(res);

  const buffer = await getArrayBufferResponse(res);

  const base64 = bytesToBase64(new Uint8Array(buffer));
  const src: string = `data:image/jpeg;base64,${base64}`
  return src;
}

export async function getItemThumbnail(item: {filename: string, id:number, indexed_time:number, additional: {thumbnail:{cache_key: string}}}, token: string, _sid: string = "") {
  const loginUrl = getItemThumbnailUrl(item, token, _sid)
  return getItemThumbnailByUrl(loginUrl);
}

/**
 * 
 * @param token the token returned by the login (synotoken)
 * @param sid the sid returned by the login
 * @returns items 
 */
export async function getFilters(token: string, sid: string) : Promise<Filters> {
  const url = getFiltersUrl(token, sid);
  const res = await fetch(url, nextRevalidate);

  checkFetchResponseErrors(res);

  return getJsonResponse<Filters>(res);
}

export async function filterItemsWithThumbs(timeFrom:number, timeTo:number, folders: number[], minStars: number, token: string, sid: string) : Promise<Items> {
  const url = getFilterItemsUrl(timeFrom, timeTo, folders, minStars, token, sid);
  const res = await fetch(url, nextRevalidate);
  
  checkFetchResponseErrors(res);

  return getJsonResponse<Items>(res);
}

// ---------------

export async function getAlbums(token: string, _sid: string = "") {
  const loginUrl = `${getCgiUrl()}?api=SYNO.Foto.Browse.Album&version=1&method=list&offset=0&limit=100&SynoToken=${token}&_sid=${_sid}`;
  const res = await fetch(loginUrl,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...nextRevalidate
  })
  
  checkFetchResponseErrors(res);

  return getJsonResponse(res);
}

export  async function getFolders(folderId: number, method: string, token: string, _sid: string = "") {
  const url = `${getCgiUrl()}?api=SYNO.FotoTeam.Browse.Folder&version=1&method=${method}&id=${folderId}&offset=0&limit=100&SynoToken=${token}&_sid=${_sid}`;
  const res = await fetch(url, nextRevalidate)
  
  checkFetchResponseErrors(res);

return getJsonResponse(res);
}

export  async function getFolderItems(folderId: number, token: string, _sid: string = "", cookie: any) {
  const url = `${getCgiUrl()}?api=SYNO.FotoTeam.Browse.Item&version=1&method=list&type=photo&offset=0&limit=100&folder_id=${folderId}&SynoToken=${token}&_sid=${_sid}`;
  const res = await fetch(url,{
    method: 'GET',
      headers: {
      'Content-Type': 'application/json'
    },
    ...nextRevalidate
  })
  
  checkFetchResponseErrors(res);

return getJsonResponse(res);
}

export async function getFolderItemsWithThumbs(folderId: number, token: string, _sid: string = "", cookie: any) {
  const url = `${getCgiUrl()}?api=SYNO.FotoTeam.Browse.Item&method=list&version=1&folder_id=${folderId}&additional=%5B%22thumbnail%22%2C%22resolution%22%2C%22orientation%22%2C%22video_convert%22%2C%22video_meta%22%5D&sort_by=%22takentime%22&sort_direction=%22asc%22&offset=0&limit=100&SynoToken=${token}&_sid=${_sid}`;
  const res = await fetch(url, nextRevalidate);
  
  checkFetchResponseErrors(res);

  return getJsonResponse(res);
}

export async function downloadItem(item: {filename: string, id:number, indexed_time:number}, token: string, _sid: string = "") {
  const url = `${getCgiUrl()}?item_id=[${item.id}]&api=SYNO.FotoTeam.Download&method=download&version=1&force_download=true&SynoToken=${token}&_sid=${_sid}`;
  const res = await fetch(url,{method: 'GET', ...nextRevalidate})
  
  checkFetchResponseErrors(res);

  return getJsonResponse(res);
}

function bytesToBase64(bytes: any) {
  const binString = Array.from(bytes, (byte: number) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
}
  
export async function downloadItemForm(item: {filename: string, id:number, indexed_time:number}, token: string, _sid: string = "", cookie: any) {
  
    const res = await fetch(`${getCgiUrl()}/SYNO.FotoTeam.Download`, {
      "credentials": "include",
      "headers": {
          "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0",
          "Accept": "*/*",
          "Accept-Language": "en,en-US;q=0.8,it;q=0.5,fr;q=0.3",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-SYNO-TOKEN": token,
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "Sec-GPC": "1",
          "Cookie": cookie
      },
      "referrer": `${getCgiUrl()}`,
      "body": `api=SYNO.FotoTeam.Download&method=download&version=1&item_id=[${item.id}]&force_download=true`,
      "method": "POST",
      "mode": "cors"
  });
  
  checkFetchResponseErrors(res);

  return getJsonResponse(res);
  }
