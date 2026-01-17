import login from "@/actions/synologyAuth";
import { Photo } from "./photo";
import { Photo as PhotoType, getPhotos } from "@/actions/photos.action";
import { unstable_cacheLife as cacheLife, unstable_cacheTag as nextCacheTag } from 'next/cache'
import RevalidateTrigger from './revalidateTrigger';

type Props = {
    currentIndex: number;
  };

// Funzione separata che applica la cache globalmente (non parametrica)
async function getCachedPhotos(): Promise<{ token: string; sid: string; photos: PhotoType[] }> {
  "use cache";
  cacheLife('photos');
  nextCacheTag('photos');
  const { synotoken, sid } = await login();
  const token = synotoken;
  
  // Retry logic per getPhotos se ritorna array vuoto
  let photos: PhotoType[] = [];
  const maxRetries = 5;
  const delayMs = 2000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    photos = await getPhotos(token, sid);
    if (photos.length > 0) {
      break;
    }
    // Se array vuoto e non è l'ultimo tentativo, attendi prima di ritentare
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return { token, sid, photos };
}

export default async function PhotoContainer({currentIndex}: Props){ 
  // Do not call revalidateTag during render — instead render a small client
  // trigger component that calls an API to perform revalidation off-render.

  const { token, sid, photos } = await getCachedPhotos();

    return (
      <>
        {currentIndex === 0 && <RevalidateTrigger enabled={true} />}
        <Photo currentIndex={currentIndex} token={token} sid={sid} photos={photos}/>
      </>
    );
}
