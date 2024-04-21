import React from "react";
import { Photo } from "@/component/ui/photo";
import login from "@/actions/synologyAuth";
import { photosSamePeriod, photosSharedAlbum } from "@/actions/photos.action";
import { getFilters } from "@/actions/synologyApi";

type Props = {
  params: {
    ssparams: (string | undefined)[];
  };
};

export default async function Slideshow({ params: { ssparams } }: Props) {
  const nextIndexStr = ssparams?.[0] ?? "0"
  const nextIndex = parseInt(nextIndexStr, 10);

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

  return (
    <Photo urls={globalThis.urls} currentIndex={nextIndex} token={globalThis.auth.synotoken} sid={globalThis.auth.sid}/>
)}
