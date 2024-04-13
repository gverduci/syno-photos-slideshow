/**
 * 
 * @returns true if there is a passphare for shared album configured
 */
export function isSharedAlbum(): boolean {
  return !!process.env.passphraseSharedAlbum;
}

/**
 * 
 * @returns true if there the environment variable USE_SHARED_SPACE is set to true
 */
export function isSharedSpace(): boolean {
  const value = Boolean(process.env.useSharedSpace);
  return value;
}

/**
 * 
 * @param addMoSharing if true add /mo/sharing to the url. Used for thumbnail
 * @returns the entry cgi url
 */
export function getCgiUrl(addMoSharing: boolean = false): string {
  return `${process.env.synologyPhotosApiBaseUrl}${
    addMoSharing ? "/mo/sharing" : ""
  }/webapi/entry.cgi`;
}

/**
 * 
 * @returns the authentication cgi url
 */
export function getAuthCgiUrl(): string {
  return `${process.env.synologyPhotosApiBaseUrl}/webapi/auth.cgi`;
}

/**
 * 
 * @param name the api sufix
 * @param sharedSpace if true use the FotoTeam type, if not defined, the environment varaible USE_SHARED_SPACE is used instead
 * @returns the full api with prefix and type (Foto and FotoTeam)
 */
export function api(
  name: string,
  sharedSpace: boolean | undefined = undefined
): string {
  const useSharedSpace =
    sharedSpace === undefined ? isSharedSpace() : sharedSpace;
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
  sid: string
) {
  const url = `${getCgiUrl(true)}?id=${item.id}&cache_key=${
    item.additional.thumbnail.cache_key
  }&type=unit&size=xl&api=${api("Thumbnail")}&method=get&version=2`;
  return withTokenAndSid(url, token, sid);
}

/**
 * 
 * @param cache_key the cache_key parameter of the item
 * @param token the token returned by the login (synotoken)
 * @param sid the sid returned by the login
 * @returns  the url for the thumbnail
 */
export function getItemThumbnailUrlByCacheKey(
  cache_key: string,
  token: string,
  sid: string
): string {
  const id = cache_key.split("_")[0];
  const url = `${getCgiUrl(
    true
  )}?id=${id}&cache_key=${cache_key}&type=unit&size=xl&api=${api(
    "Thumbnail"
  )}&method=get&version=2`;
  if (process.env.passphraseSharedAlbum) {
    const urlWithPassphrase = `${url}&passphrase=${process.env.passphraseSharedAlbum}`;
    return withTokenAndSid(urlWithPassphrase, token, sid);
  }
  return withTokenAndSid(url, token, sid);
}

/**
 * this function uses the passphrase given in the .env vaiable PASSPHRASE_SHARED_ALBUM
 * 
 * @param token the token returned by the login (synotoken)
 * @param sid the sid returned by the login
 * @returns the url to get a shared albumn
 */
export function getBrowseSharedAlbumUrl(token: string, sid: string) {
  const additional = `["sharing_info","flex_section","provider_count","thumbnail"]`;
  const additionalEncoded = encodeURIComponent(additional);
  const url = `${getCgiUrl()}?api=${api(
    "Browse.Album"
  )}&version=1&method=get&passphrase=${
    process.env.passphraseSharedAlbum
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
 * @returns the url to get the items of a shared album
 */
export function getBrowseSharedAlbumItemUrl(
  offset: number,
  limit: number,
  token: string,
  sid: string
) {
  const additional = `["thumbnail","resolution","orientation","video_convert","video_meta","provider_user_id"]`;
  const additionalEncoded = encodeURIComponent(additional);
  const url = `${getCgiUrl()}?api=${api(
    "Browse.Item"
  )}&method=list&version=1&additional=${additionalEncoded}&sort_by=%22takentime%22&sort_direction=%22asc%22&offset=${offset}&limit=${limit}`;
  const urlWithPassphrase = `${url}&passphrase=${process.env.passphraseSharedAlbum}`;
  return withTokenAndSid(urlWithPassphrase, token, sid);
}

/**
 * 
 * @returns the login url
 */
export function getLoginUrl(): string {
  return `${getAuthCgiUrl()}?api=SYNO.API.Auth&version=3&method=login&account=${
    process.env.synologyPhotosUsername
  }&passwd=${process.env.synologyPhotosPassword}&enable_syno_token=yes`;
}
