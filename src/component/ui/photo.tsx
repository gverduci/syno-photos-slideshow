import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import { getItemThumbnailByUrl } from "@/actions/synologyApi";
import Image from "next/image";
import { Refresh } from "./refresh";
import { getItemThumbnailUrlByCacheKey } from "@/utils/utils";
import { Photo as PhotoType } from "@/actions/photos.action";
import logger from "@/utils/logger";
import PhotoSkeleton from './photoSkeleton';

type Props = {
    currentIndex: number;
    token: string;
    sid: string;
    photos: PhotoType[]
  };

TimeAgo.addDefaultLocale(en)

export const Photo = async ({currentIndex, token, sid, photos}: Props) => { 
  if (photos.length > 0 && currentIndex <= photos.length - 1 && token && sid){
    logger.info(`${currentIndex} ${photos[currentIndex].name}`);
    const url: string = getItemThumbnailUrlByCacheKey(photos[currentIndex].cache_key, token, sid);
    const src = await getItemThumbnailByUrl(url);
    const nextIndex = currentIndex + 1 > photos.length -1 ? 0 : currentIndex + 1;
    const datePhoto = photos[currentIndex].time * 1000;
    const timeAgo = new TimeAgo('it-IT')
    const ago = timeAgo.format(new Date(datePhoto))
    
    return <div className="relative h-screen">
      <Refresh nextIndex={nextIndex} />
      <Image 
        src={src} 
        alt="image" 
        fill
        style={{objectFit:"contain"}}
      />
      <div className="absolute right-0 bottom-0 px-4 py-3 pr-20 w-50">
          <h2 className="text-5xl font-bold">
              {ago}
          </h2>
      </div>
    </div>;
  }
  logger.info(`#no photos?! # ${photos.length} - ${currentIndex}`);
  return <PhotoSkeleton />;
}
