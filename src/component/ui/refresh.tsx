"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
    nextIndex: number
  };

export const Refresh = ({nextIndex}: Props) => { 
    const router = useRouter();
    
    useEffect(() => {
        // push the new url to the router after X second
        const timeoutId = setTimeout(() => {
            router.push(`/slideshow/${nextIndex}`)
        }, parseInt(process.env.slideshowTiming || "15000", 10));
        return () => clearTimeout(timeoutId);
    }, [nextIndex, router]);
    
    return null;
}