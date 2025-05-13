"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PhotoSkeleton from "./photoSkeleton";

export const RedirectToHome = () => { 
    const router = useRouter();
    
    useEffect(() => {
        // push the home url to the router after X second
        const timeoutId = setTimeout(() => {
            router.push('/')
        }, parseInt(process.env.slideshowTiming || "20000", 10));
        return () => clearTimeout(timeoutId);
    }, [router]);
    
    return <PhotoSkeleton />;
}