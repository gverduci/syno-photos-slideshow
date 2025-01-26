import login from "@/actions/synologyAuth";
import { Photo } from "./photo";
import { Photo as PhotoType, getPhotos } from "@/actions/photos.action";

type Props = {
    currentIndex: number;
  };

export default async function PhotoContainer({currentIndex}: Props){ 
    const {synotoken, sid} = await login();
    const photos: PhotoType[] = await getPhotos(synotoken, sid);

    return (
        <Photo currentIndex={currentIndex} token={synotoken} sid={sid} photos={photos}/>
    );
}
