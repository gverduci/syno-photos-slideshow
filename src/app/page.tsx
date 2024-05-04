import login from "@/actions/synologyAuth";
import { Photo as PhotoType, getPhotos } from "@/actions/photos.action";
import { Photo } from "@/component/ui/photo";

export default async function Home() {
  const auth = await login();
  const  photos: PhotoType[] = await getPhotos(auth.synotoken, auth.sid);
  
  return (
    <Photo photos={photos} currentIndex={0} token={auth.synotoken} sid={auth.sid} />
  );
}
