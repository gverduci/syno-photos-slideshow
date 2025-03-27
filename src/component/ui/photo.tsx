import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import { getItemThumbnailByUrl } from "@/actions/synologyApi";
import { RefreshImage } from "./refreshImage";
import { getItemThumbnailUrlByCacheKey } from "@/utils/utils";
import { Photo as PhotoType } from "@/actions/photos.action";
import getLogger from "@/utils/logger";
import PhotoSkeleton from './photoSkeleton';
import { getConfig } from '@/utils/config';

type Props = {
    currentIndex: number;
    token: string;
    sid: string;
    photos: PhotoType[]
  };

TimeAgo.addDefaultLocale(en)

export const Photo = async ({currentIndex, token, sid, photos}: Props) => { 
  const logger = getLogger();
  const config = getConfig();
  if (photos.length > 0 && currentIndex <= photos.length - 1 && token && sid){
    logger.info(`${currentIndex} ${photos[currentIndex].name}`);
    const url: string = getItemThumbnailUrlByCacheKey(photos[currentIndex].cache_key, token, sid, config);
    const src = await getItemThumbnailByUrl(url);
    const nextIndex = currentIndex + 1 > photos.length -1 ? 0 : currentIndex + 1;
    const datePhoto = photos[currentIndex].time * 1000;
    const timeAgo = new TimeAgo('it-IT')
    const ago = timeAgo.format(new Date(datePhoto))
    
    return <div className="relative h-screen">
      <RefreshImage nextIndex={nextIndex} src={src}/>
      <div className="absolute right-0 bottom-0 px-4 py-3 pr-20 w-100">
          <h2 className="text-5xl font-bold">
              {ago}
          </h2>
      </div>
    </div>;
  }
  logger.info(`#no photos?! # ${photos.length} - ${currentIndex}`);
  return <PhotoSkeleton />;
}
