import login from "@/actions/synologyAuth";
import { Photo as PhotoType, getPhotos } from "@/actions/photos.action";
import { Photo } from "@/component/ui/photo";
import { revalidatePath } from "next/cache";

export default async function Home() {
  const auth = await login();
  const photos: PhotoType[] = await getPhotos(auth.synotoken, auth.sid);
  
  // the next time the home is displayed the cache will be revalidated
  revalidatePath('/');

  return (
    <Photo photos={photos} currentIndex={0} token={auth.synotoken} sid={auth.sid} />
  );
}
