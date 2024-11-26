import login from "@/actions/synologyAuth";
import { Photo as PhotoType, getPhotos } from "@/actions/photos.action";
import { Photo } from "@/component/ui/photo";
import logger from "@/utils/logger";

export default async function Home() {
  try{ 
    const auth = await login();
    const photos: PhotoType[] = await getPhotos(auth.synotoken, auth.sid);
    
    return (
      <Photo photos={photos} currentIndex={0} token={auth.synotoken} sid={auth.sid} />
    );
  }
  catch(err) {
    logger.error(err);
    logger.error("Get photos error!");
    throw new Error("Get photos error!")
  }
}
