import { AppConfig } from "./config";

/**
 * @param config the app configuration
 * @returns true if there is a passphare for shared album configured
 */
export function isSharedAlbum(config:AppConfig): boolean {
  return !!config.synology.passphraseSharedAlbum;
}

/**
 * @param config the app configuration
 * @returns true if there the environment variable USE_SHARED_SPACE is set to true
 */
export function isSharedSpace(config:AppConfig): boolean {
  const value = config.slideShow.useSharedSpace === true;
  return value;
}

/**
 * @param config the app configuration
 * @param addMoSharing if true add /mo/sharing to the url. Used for thumbnail
 * @returns the entry cgi url
 */
export function getCgiUrl(config:AppConfig, addMoSharing: boolean = false): string {
  return `${config.synology.baseUrl}${
    addMoSharing ? "/mo/sharing" : ""
  }/webapi/entry.cgi`;
}

/**
 * @param config the app configuration
 * @returns the authentication cgi url
 */
export function getAuthCgiUrl(config:AppConfig): string {
  return `${config.synology.baseUrl}/webapi/entry.cgi`;
}

/**
 *
 * @param name the api sufix
 * @param config the app configuration
 * @param sharedSpace if true use the FotoTeam type, if not defined, the environment varaible USE_SHARED_SPACE is used instead
 * @returns the full api with prefix and type (Foto and FotoTeam)
 */
export function api(
  name: string,
  config: AppConfig,
  sharedSpace: boolean | undefined = undefined
): string {
  const useSharedSpace =
    sharedSpace === undefined ? isSharedSpace(config) : sharedSpace;
  if (useSharedSpace) return `SYNO.FotoTeam.${name}`;
  return `SYNO.Foto.${name}`;
}

/**
 *
 * @param url the original url
 * @param token the token returned by the login (synotoken)
 * @param sid the sid returned by the login
 * @returns the url with the token and the _sid parameters
 */
export function withTokenAndSid(
  url: string,
  token: string,
  sid: string
): string {
  return `${url}&SynoToken=${token}&_sid=${sid}`;
}

/**
 *
 * @param item the item obtained with the additional thumbnail parameter
 * @param token the token returned by the login (synotoken)
 * @param sid the sid returned by the login
 * @param config the app configuration
 * @returns the url for the thumbnail
 */
export function getItemThumbnailUrl(
  item: {
    filename: string;
    id: number;
    indexed_time: number;
    additional: { thumbnail: { cache_key: string } };
  },
  token: string,
  sid: string,
  config: AppConfig
) {
  const url = `${getCgiUrl(config, true)}?id=${item.id}&cache_key=${
    item.additional.thumbnail.cache_key
  }&type=unit&size=xl&api=${api("Thumbnail", config)}&method=get&version=2`;
  return withTokenAndSid(url, token, sid);
}

/**
 *
 * @param cache_key the cache_key parameter of the item
 * @param token the token returned by the login (synotoken)
 * @param sid the sid returned by the login
 * @param config the app configuration
 * @returns  the url for the thumbnail
 */
export function getItemThumbnailUrlByCacheKey(
  cache_key: string,
  token: string,
  sid: string,
  config: AppConfig
): string {
  const id = cache_key.split("_")[0];
  const url = `${getCgiUrl(
    config,
    true
  )}?id=${id}&cache_key=${cache_key}&type=unit&size=xl&api=${api(
    "Thumbnail",
    config
  )}&method=get&version=2`;
  if (config.synology.passphraseSharedAlbum) {
    const urlWithPassphrase = `${url}&passphrase=${config.synology.passphraseSharedAlbum}`;
    return withTokenAndSid(urlWithPassphrase, token, sid);
  }
  return withTokenAndSid(url, token, sid);
}

/**
 * this function uses the passphrase given in the .env vaiable PASSPHRASE_SHARED_ALBUM
 *
 * @param token the token returned by the login (synotoken)
 * @param sid the sid returned by the login
 * @param config the app configuration
 * @returns the url to get a shared albumn
 */
export function getBrowseSharedAlbumUrl(token: string, sid: string, config: AppConfig) {
  const additional = `["sharing_info","flex_section","provider_count","thumbnail"]`;
  const additionalEncoded = encodeURIComponent(additional);
  const url = `${getCgiUrl(config)}?api=${api(
    "Browse.Album",
    config
  )}&version=1&method=get&passphrase=${
    config.synology.passphraseSharedAlbum
  }&additional=${additionalEncoded}`;
  return withTokenAndSid(url, token, sid);
}

/**
 * this function uses the passphrase given in the .env vaiable PASSPHRASE_SHARED_ALBUM
 *
 * @param offset page number
 * @param limit max page elements
 * @param token the token returned by the login (synotoken)
 * @param sid the sid returned by the login
 * @param config the app configuration
 * @returns the url to get the items of a shared album
 */
export function getBrowseSharedAlbumItemUrl(
  offset: number,
  limit: number,
  token: string,
  sid: string,
  config: AppConfig
) {
  const additional = `["thumbnail","resolution","orientation","video_convert","video_meta","provider_user_id"]`;
  const additionalEncoded = encodeURIComponent(additional);
  const url = `${getCgiUrl(config)}?api=${api(
    "Browse.Item",
    config
  )}&method=list&version=1&additional=${additionalEncoded}&sort_by=%22takentime%22&sort_direction=%22asc%22&offset=${offset}&limit=${limit}`;
  const urlWithPassphrase = `${url}&passphrase=${config.synology.passphraseSharedAlbum}`;
  return withTokenAndSid(urlWithPassphrase, token, sid);
}

/**
 *
 * @param token the token returned by the login (synotoken)
 * @param sid the sid returned by the login
 * @param config the app configuration
 * @returns the url to get the items of a shared album
 */
export function getFiltersUrl(token: string, sid: string, config: AppConfig) {
  const additional = `["thumbnail"]`;
  const setting =
    '{"focal_length_group":false,"general_tag":false,"iso":false,"exposure_time_group":false,"camera":false,"item_type":true,"time":true,"aperture":false,"flash":false,"person":false,"geocoding":true,"rating":true,"lens":false}';
  const additionalEncoded = encodeURIComponent(additional);
  const url = `${getCgiUrl(config)}?api=${api(
    "Search.Filter",
    config
  )}&method=list&version=2&additional=${additionalEncoded}&setting=${setting}`;
  return withTokenAndSid(url, token, sid);
}

/**
 * 
 * @param timeFrom start time in unixtime
 * @param timeTo end time in unix time
 * @param folders list of folder ids
 * @param minStars minimum rating [0 to 5]
 * @param token the token returned by the login (synotoken)
 * @param sid the sid returned by the login
 * @param config the app configuration
 * @returns the url to get filtered items
 */
export function getFilterItemsUrl(
  timeFrom: number,
  timeTo: number,
  folders: number[],
  minStars: number,
  token: string,
  sid: string,
  config: AppConfig
) {
  const additional = `["thumbnail","resolution","orientation","video_convert","video_meta"]`;
  const additionalEncoded = encodeURIComponent(additional);
  const time = `[{"start_time":${timeFrom},"end_time":${timeTo}}]`;
  const timeEncoded = encodeURIComponent(time);
  const stars = [0, 1, 2, 3, 4, 5];
  const rating: string = `[${stars.slice(minStars).join(",")}]`;
  const ratingEncoded = encodeURIComponent(rating);
  const url = `${getCgiUrl(config)}?api=${api(
    "Browse.Item",
    config
  )}&method=list_with_filter&version=2&additional=${additionalEncoded}&rating=${ratingEncoded}&time=${timeEncoded}&sort_by=%22takentime%22&sort_direction=%22asc%22&offset=0&limit=100`;

  const foldersString: string = folders.length > 0 ? `[${folders.slice(minStars).join(",")}]` : "";
  const foldersStringEncoded = folders.length > 0 ? encodeURIComponent(foldersString) : "";
  
  if(foldersStringEncoded){
    return withTokenAndSid(`${url}&folder=${foldersStringEncoded}`, token, sid);
  }

  return withTokenAndSid(url, token, sid);
}

/**
 *
 * @returns the login url
 */
export function getLoginUrl(config:AppConfig): string {
  return `${getAuthCgiUrl(config)}?api=SYNO.API.Auth&version=6&method=login&account=${
    config.synology.username
  }&passwd=${config.synology.password}&enable_syno_token=yes`;
}
