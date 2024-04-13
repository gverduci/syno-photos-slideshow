import login from "@/actions/auth";
import { photosSamePeriod, photosSharedAlbum } from "@/actions/photos.action";
import { Photo } from "@/component/ui/photo";

export default async function Home() {
  const auth = await login();

  // const folders = await getFolders(1, "list_parents",auth.synotoken, auth.sid);
  // const subFolders = await getFolders(folders.data.list[2].id, "list", auth.synotoken, auth.sid);
  // const itemsWT = await getFolderItemsWithThumbs(subFolders.data.list[1].id, auth.synotoken, auth.sid, auth.cookie);

  let urls: string[] = [];
  if (process.env.passphraseSharedAlbum){
    urls = await photosSharedAlbum(auth);
  }
  else{
    urls = await photosSamePeriod(auth, 7, 2016);
  }

  return (
    <Photo urls={urls} currentIndex={0} token={auth.synotoken} sid={auth.sid} />
  );
}
