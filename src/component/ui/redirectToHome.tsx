"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { revalidatePath } from "next/cache";

export const RedirectToHome = () => { 
    const router = useRouter();
    
    useEffect(() => {
        revalidatePath("/");
        router.push(`/`);
    }, [router]);
    
    return null;
}