'use client';
import { useEffect } from 'react';

export default function RevalidateTrigger({ enabled = true }: { enabled?: boolean }) {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const doRevalidate = async () => {
      try {
        await fetch('/api/revalidate/photos', { method: 'POST' });
      } catch (e) {
        // swallow; this is best-effort and must not break the UI
        // keep a console.debug for local troubleshooting
        console.debug('RevalidateTrigger: failed to call revalidate API', e);
      }
    };

    doRevalidate();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return null;
}
