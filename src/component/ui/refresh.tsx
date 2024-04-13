"use client";
import { setCookies } from "@/actions/cookies";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
    urls: string[];
    nextIndex: number;
    token: string | undefined;
    sid: string | undefined;
  };

export const Refresh = ({urls, nextIndex, token, sid}: Props) => { 
    const router = useRouter();
    
    useEffect(() => {
      async function callSetCookies2() {
        await setCookies(token, sid);
      }
      callSetCookies2();
    }, []);

    useEffect(() => {
        // push the new url to the router after 5 second
        const timeoutId = setTimeout(() => {
            router.push(`/slideshow/${urls}/${nextIndex}`)
        }, parseInt(process.env.slideshowTiming || "0",10));
        return () => clearTimeout(timeoutId);
    }, [urls, nextIndex, router]);
    
    return null;
}