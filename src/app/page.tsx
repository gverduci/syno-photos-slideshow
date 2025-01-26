import React, { Suspense } from 'react'
import login from "@/actions/synologyAuth";
import PhotoContainer from '@/component/ui/photoContainer';
import PhotoSkeleton from '@/component/ui/photoSkeleton';

export default async function Home() {
  return (
    <Suspense fallback={<PhotoSkeleton />}>
      <PhotoContainer currentIndex={0} />
    </Suspense>
  );
}
