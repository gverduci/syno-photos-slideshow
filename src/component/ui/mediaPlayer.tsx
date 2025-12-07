'use client';

import { useEffect, useState } from 'react';
import logger from '@/utils/loggerBrowser';

interface MediaInfo {
  title?: string;
  artist?: string;
}

type Props = {
  nextIndex?: number;
};

export const MediaPlayer = ({ nextIndex }: Props) => {
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchMediaInfo = async () => {
      try {
        // Request only title and artist to reduce payload on low-power FE
        const response = await fetch('/api/openhab?fields=title,artist');

        if (!response.ok) {
          throw new Error(`OpenHab API error: ${response.status}`);
        }

        const data: { title?: string; artist?: string } = await response.json();

        // Server returns a decoupled object with optional title/artist
        const info: MediaInfo = {
          title: data.title,
          artist: data.artist,
        };

        const hasContent = Boolean(info.title || info.artist);
        if (hasContent) {
          setMediaInfo(info);
          setIsPlaying(true);
        } else {
          setMediaInfo(null);
          setIsPlaying(false);
        }
      } catch (error) {
        logger.error('Failed to fetch media info from OpenHab:', error);
        setMediaInfo(null);
        setIsPlaying(false);
      }
    };

    // Fetch iniziale
    fetchMediaInfo();

    // Fetch periodico ogni 5 secondi
    const interval = setInterval(fetchMediaInfo, 5000);

    return () => clearInterval(interval);
  }, [nextIndex]);

  if (!isPlaying || !mediaInfo || (!mediaInfo.title && !mediaInfo.artist)) {
    return null;
  }

  return (
    <div className="absolute left-0 bottom-0 px-4 py-3 pl-20 w-full max-w-[80%]">
      <div className="text-white">
        {mediaInfo.title && (
          <p className="text-xl font-semibold truncate">
            {mediaInfo.title}
          </p>
        )}
        {mediaInfo.artist && (
          <p className="text-lg truncate opacity-90">
            {mediaInfo.artist}
          </p>
        )}
      </div>
    </div>
  );
};
