import React, { Suspense } from 'react'
import login from "@/actions/synologyAuth";
import { Photo as PhotoType, getPhotos } from "@/actions/photos.action";
import { Photo } from "@/component/ui/photo";
import logger from "@/utils/logger";

function TransactionSkeleton() {
  return <ul>...</ul>
}

export default async function Home() {
  try{ 
    const auth = await login();
    return (
      <Suspense fallback={<TransactionSkeleton />}>
        <Photo currentIndex={0} token={auth.synotoken} sid={auth.sid} />
      </Suspense>
    );
  }
  catch(err) {
    logger.error(err);
    logger.error("Get photos error!");
    throw new Error("Get photos error!")
  }
}
