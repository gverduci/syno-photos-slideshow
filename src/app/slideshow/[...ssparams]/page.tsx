import React, { Suspense } from 'react'
import { Photo } from "@/component/ui/photo";
import login from "@/actions/synologyAuth";
import logger from "@/utils/logger";

type Props = Promise<{ssparams: (string | undefined)[]}>;

function TransactionSkeleton() {
  return <ul>...</ul>
}

export default async function Slideshow(props: { params: Props }) {
  try{ 
  const ssparams = await props.params.then((p) => p.ssparams);
  const nextIndexStr = ssparams?.[0] ?? "0"
  const nextIndex = parseInt(nextIndexStr, 10);

  const auth = await login();

  return (
    <Suspense fallback={<TransactionSkeleton />}>
      <Photo currentIndex={nextIndex} token={auth.synotoken} sid={auth.sid}/>
    </Suspense>
   
  );
} catch(err) {
    logger.error(err);
    logger.error("Get slideshow photo error!");
    throw new Error("Get slideshow photo error!")
  }
}
