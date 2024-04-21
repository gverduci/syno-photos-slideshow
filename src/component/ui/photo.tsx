import { getItemThumbnailByUrl } from "@/actions/synologyApi";
import Image from "next/image";
import { Refresh } from "./refresh";
import { getItemThumbnailUrlByCacheKey } from "@/utils/utils";

type Props = {
    urls: string[];
    currentIndex: number;
    token: string | undefined;
    sid: string | undefined;
  };

export const Photo = async ({urls, currentIndex, token, sid}: Props) => { 
  if (urls.length > 0 && currentIndex <= urls.length - 1 && token && sid){
    const url: string = getItemThumbnailUrlByCacheKey(urls[currentIndex], token, sid);
    const src: string = await getItemThumbnailByUrl(url);
    const nextIndex = currentIndex + 1 > urls.length -1 ? 0 : currentIndex + 1;
    return <>
      <Refresh nextIndex={nextIndex} />
      <Image 
        src={src} 
        alt="image" 
        fill
        style={{objectFit:"contain"}}
      />
    </>;
  }
  return <div>loading...</div>;
}
