import { Photo } from "@/component/ui/photo";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import React from "react";

type Props = {
  params: {
    ssparams: (string | undefined)[];
  };
};

export default function Slideshow({ params: { ssparams } }: Props) {
  const tokenObj: RequestCookie | undefined = cookies().get("token");
  const sidObj: RequestCookie | undefined = cookies().get("sid");
  const token:string = tokenObj?.value || "";
  const sid:string = sidObj?.value || "";
  const urlCollectionStr = ssparams?.[0] ?? "";
  const nextIndexStr = ssparams?.[1] ?? "0"
  const urlCollection = urlCollectionStr ? urlCollectionStr.split("%2C"):[]
  const nextIndex = parseInt(nextIndexStr, 10);
  
  return (
    <Photo urls={urlCollection} currentIndex={nextIndex} token={token} sid={sid}/>
)}
