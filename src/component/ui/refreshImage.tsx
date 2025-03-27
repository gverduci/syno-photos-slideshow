"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { unstable_ViewTransition as ViewTransition } from "react"

const cx = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}
type Props = {
    nextIndex: number,
    src: string
  };

export const RefreshImage = ({nextIndex, src}: Props) => { 
    const router = useRouter();
    
    useEffect(() => {
        // push the new url to the router after X second
        const timeoutId = setTimeout(() => {
            router.push(`/slideshow/${nextIndex}`)
        }, parseInt(process.env.slideshowTiming || "20000", 10));
        return () => clearTimeout(timeoutId);
    }, [nextIndex, router]);
    let style = "";
    if (process.env.transition === "sliding"){
      style = `
        @keyframes enter-slide-left {
          0% {
            opacity: 0;
            transform: translate(-900px, 0);
          }
          100% {
            opacity: 1;
            transform: translate(0, 0);
          }
        }

        @keyframes exit-slide-right {
          0% {
            opacity: 1;
            transform: translate(0, 0);
          }
          100% {
            opacity: 0;
            transform: translate(900px, 0);
            
          }
        }

        ::view-transition-group(photo) {
          animation: {opacity: 0;}
          animation-duration: 2s;
        }

        ::view-transition-new(photo) {
          animation: enter-slide-left ease-in 1s;
          animation-delay: 0ms;
          animation-duration: 2s;
        }
        ::view-transition-old(photo) {
          animation: exit-slide-right ease-out 1s;
          animation-delay: 0ms;
          animation-duration: 2s;
        }
      `;
    }
    else if (process.env.transition === "fading"){
      style = `
        ::view-transition-group(photo),
        ::view-transition-new(photo),
        ::view-transition-old(photo) {
            animation-duration: 2s;
            animation-timing-function: cubic-bezier(0.5, 0.2, 0.2, 0.5);
        }
      `;        
    }
    return (
      <>
        <style>{style}</style>
        <ViewTransition name="photo">
          <Image
              src={src} 
              alt="image" 
              fill
              style={{objectFit:"contain"}}
          />
        </ViewTransition>
      </>
    );
}