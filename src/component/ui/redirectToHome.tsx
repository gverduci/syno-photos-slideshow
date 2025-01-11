"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { revalidateTag } from "next/cache";

export const RedirectToHome = () => { 
    const router = useRouter();
    
    useEffect(() => {
        revalidateTag("photos");
        router.push(`/`);
    }, [router]);
    
    return null;
}