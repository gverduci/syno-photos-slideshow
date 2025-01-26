import React, { Suspense } from 'react'
import PhotoContainer from '@/component/ui/photoContainer';
import PhotoSkeleton from '@/component/ui/photoSkeleton';

type Props = {
  index: Promise<string>;
};

async function PhotoContainerParams({index}: Props){ 
  const indexString =  await index;
  const currentIndex = parseInt(indexString, 10);

  return (
    <PhotoContainer currentIndex={currentIndex} />
  );
}

export default async function Slideshow({
  params,
}: {
  params: Promise<{ index: string }>
}) {
  const nextIndex = params.then((p) => p.index);

  return (
    <Suspense fallback={<PhotoSkeleton />}>
      <PhotoContainerParams index={nextIndex} />
    </Suspense>
  );
}
