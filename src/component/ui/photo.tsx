import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import { getItemThumbnailByUrl } from "@/actions/synologyApi";
import Image from "next/image";
import { Refresh } from "./refresh";
import { getItemThumbnailUrlByCacheKey } from "@/utils/utils";
import { Photo as PhotoType } from "@/actions/photos.action";

type Props = {
    urls: PhotoType[];
    currentIndex: number;
    token: string | undefined;
    sid: string | undefined;
  };

TimeAgo.addDefaultLocale(en)

export const Photo = async ({urls, currentIndex, token, sid}: Props) => { 
  if (urls.length > 0 && currentIndex <= urls.length - 1 && token && sid){
    const url: string = getItemThumbnailUrlByCacheKey(urls[currentIndex].cache_key, token, sid);
    const src: string = await getItemThumbnailByUrl(url);
    const nextIndex = currentIndex + 1 > urls.length -1 ? 0 : currentIndex + 1;
    const datePhoto = urls[currentIndex].time * 1000;
    const timeAgo = new TimeAgo('it-IT')
    const ago = timeAgo.format(new Date(datePhoto))
    // const timeNow = new Date().getTime() / 1000;
    // const diff = timeNow - datePhoto;
    // const diffDays = Math.ceil(diff / (60 * 60 * 24)); 
    // let ago = "";
    // if (diffDays < 365 && diffDays > 30){
    //   const months = Math.ceil(diffDays / 30);
    //   if (months > 1){
    //     ago = `${months} months ago`
    //   } else {
    //     ago = `${months} month ago`
    //   }
    // } else if (diffDays >= 365){
    //   const years = Math.ceil(diffDays / 365);
    //   if (years > 1){
    //     ago = `${years} years ago`
    //   } else {
    //     ago = `${years} year ago`
    //   }
    // } else {
    //   if (diffDays > 1){
    //     ago = `${diffDays} days ago`
    //   } else {
    //     ago = `${diffDays} day ago`
    //   }
    // }
    return <div className="relative h-screen">
      <Refresh nextIndex={nextIndex} />
      <Image 
        src={src} 
        alt="image" 
        fill
        style={{objectFit:"contain"}}
      />
      <div className="absolute right-0 bottom-0 px-4 py-3 w-50">
          <h2 className="text-3xl font-bold">
              {ago}
          </h2>
      </div>
    </div>;
  }
  return <div>loading...</div>;
}
