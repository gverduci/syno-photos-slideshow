"use client"

import { useRouter } from "next/navigation";
import logger from "@/utils/loggerBrowser";
import { useEffect } from "react";
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    // Optionally log the error to an error reporting service
    logger.error(error);
  }, [error]);

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h3 className="text-center text-2xl">Something went wrong (error)!</h3>
      <h4 className="text-center text-xl">{error?.message || "generic error"}</h4>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-xl text-white transition-colors hover:bg-blue-400 uppercase h-20 w-40"
        onClick={
          // Attempt to recover by trying to re-render the invoices route
          () => {
            router.push(`/`);
          }
        }
      >
        Try again
      </button>
    </main>
  )
}