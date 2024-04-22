import login from "@/actions/synologyAuth";
import { Photo as PhotoType, getPhotos } from "@/actions/photos.action";
import { Photo } from "@/component/ui/photo";

export default async function Home() {
  const auth = await login();
  const  urls: PhotoType[] = await getPhotos(auth.synotoken, auth.sid);
  
  return (
    <Photo urls={urls} currentIndex={0} token={auth.synotoken} sid={auth.sid} />
  );
}
