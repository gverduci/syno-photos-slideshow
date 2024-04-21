import login from "@/actions/synologyAuth";
import { photosSamePeriod, photosSharedAlbum } from "@/actions/photos.action";
import { getFilters } from "@/actions/synologyApi";
import { Photo } from "@/component/ui/photo";

export default async function Home() {
  const auth = await login();
  globalThis.auth = auth;

  // const folders = await getFolders(1, "list_parents",auth.synotoken, auth.sid);
  // const subFolders = await getFolders(folders.data.list[2].id, "list", auth.synotoken, auth.sid);
  // const itemsWT = await getFolderItemsWithThumbs(subFolders.data.list[1].id, auth.synotoken, auth.sid, auth.cookie);

  let urls: string[] = [];
  if (process.env.passphraseSharedAlbum){
    urls = await photosSharedAlbum(auth);
  }
  else{
    const filters = await getFilters(globalThis.auth.synotoken, globalThis.auth.sid);
    urls = await photosSamePeriod(auth, parseInt(process.env.daysInterval || "7", 10), filters.data.time[filters.data.time.length - 1].year);
  }

  globalThis.urls = urls;

  console.info(globalThis.auth.synotoken)
  console.error(globalThis.auth.synotoken)
  
  return (
    <Photo urls={globalThis.urls} currentIndex={0} token={globalThis.auth.synotoken} sid={globalThis.auth.sid} />
  );
}
