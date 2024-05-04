import React from "react";
import { Photo } from "@/component/ui/photo";
import login from "@/actions/synologyAuth";
import { Photo as PhotoType, getPhotos, photosSamePeriod, photosSharedAlbum } from "@/actions/photos.action";

type Props = {
  params: {
    ssparams: (string | undefined)[];
  };
};

export default async function Slideshow({ params: { ssparams } }: Props) {
  const nextIndexStr = ssparams?.[0] ?? "0"
  const nextIndex = parseInt(nextIndexStr, 10);
  
  const auth = await login();

  const  photos: PhotoType[] = await getPhotos(auth.synotoken, auth.sid);

  return (
    <Photo photos={photos} currentIndex={nextIndex} token={auth.synotoken} sid={auth.sid}/>
)}
