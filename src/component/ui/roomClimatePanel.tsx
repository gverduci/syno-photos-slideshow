'use client';

import { useEffect, useState } from 'react';
import logger from '@/utils/loggerBrowser';
import { RoomData } from '@/app/api/openhab/rooms/route';

export const RoomClimatePanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRoomData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/openhab/rooms');
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setRooms(data.rooms || []);
      } catch (error) {
        logger.error('Failed to fetch room data:', error);
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch iniziale
    fetchRoomData();

    // Fetch periodico ogni 30 secondi
    const interval = setInterval(fetchRoomData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (rooms.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        key="climate-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 hover:bg-gray-700 text-white rounded-full p-4 shadow-lg transition-all"
        aria-label="Toggle climate panel"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m6.364 1.636l-.707.707M21 12h-1m1.364 6.364l-.707-.707M12 21v-1m-6.364-1.636l.707-.707M3 12h1M3.636 5.636l.707.707"
          />
        </svg>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute top-16 right-0 bg-gray-900 text-white rounded-lg shadow-2xl p-4 w-96 border border-gray-700" style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Climate</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {isLoading && (
            <div className="text-center text-gray-400 py-4">
              Loading...
            </div>
          )}

          {!isLoading && rooms.length > 0 && (
            <div className="space-y-3">
              {rooms.map((room) => {
                const temp = room.temperature;
                const hum = room.humidity;

                function hsv_to_hsl(hsb: string | null | undefined): [number, number, number] {
                  if (!hsb) return [0, 0, 0];
                  let [h, s1, v1] = hsb.split(',').map(Number);
                  let s = s1 / 100;
                  const v = v1 / 100;
                  var l = ((2 - s) * v / 2);

                  if (l != 0) {
                      if (l == 1) {
                          s = 0;
                      } else if (l < 0.5) {
                          s = s * v / (l * 2);
                      } else {
                          s = s * v / (2 - l * 2);
                      }
                  }

                  return [h, s * 100, l * 100];
                }

                const contrastRatio = (L1: number, L2: number) => {
                  const lighter = Math.max(L1, L2);
                  const darker = Math.min(L1, L2);
                  return (lighter + 0.05) / (darker + 0.05);
                };

                // Compute luminances
                const leftHsl = hsv_to_hsl(room.moldRiskColor);
                const rightHsl = hsv_to_hsl(room.disconfortColor);
                const lumLeft = leftHsl[2];
                const lumRight = rightHsl[2];

                // Contrast vs white (luminance 1) and black (luminance 0)
                const contrastWhite = (contrastRatio(1, lumLeft) + contrastRatio(1, lumRight)) / 2;
                const contrastBlack = (contrastRatio(0, lumLeft) + contrastRatio(0, lumRight)) / 2;

                const textColor = contrastWhite >= contrastBlack ? '#ffffff' : '#000000';

                const bgStyle: React.CSSProperties = {
                  backgroundImage: room.indoor
                    ? `linear-gradient(90deg, hsl(${leftHsl[0]}, ${leftHsl[1]}%, ${leftHsl[2]}%) 0 50%, hsl(${rightHsl[0]}, ${rightHsl[1]}%, ${rightHsl[2]}%) 50% 100%)`
                    : `linear-gradient(90deg, hsl(${rightHsl[0]}, ${rightHsl[1]}%, ${rightHsl[2]}%) 0 100%)`,
                  color: textColor,
                };

                return (
                  <div
                    key={room.name}
                    className="rounded-lg p-4 border border-gray-700 text-white relative min-w-[18rem]"
                    style={bgStyle}
                  >
                    <h4 className="font-medium text-sm mb-2 capitalize" style={{ color: textColor }}>
                      {room.name}
                    </h4>
                    <div className="flex justify-between text-sm">
                      {temp !== null && (
                        <div className="flex items-center mb-4">
                          <span className="ml-1">
                            {temp.toFixed(1)}°C
                          </span>
                        </div>
                      )}
                      {hum !== null && (
                        <div className="flex items-center mb-4">
                          <span className="ml-1">
                            {hum.toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Left label (dew point class) - only for indoor rooms */}
                    {room.dewPoint !== null && room.indoor && (
                      <div className="absolute bottom-2 left-2 w-1/2 text-xs font-semibold truncate mt-2">
                        {/* {classjfyDewPoint(dewPoint).toString().charAt(0).toUpperCase() + classjfyDewPoint(dewPoint).toString().slice(1)} */}
                        {room.moldRisk}
                      </div>
                    )}

                    {/* Right label (discomfort description) */}
                    {temp !== null && hum !== null && (
                      <div className="absolute bottom-2 right-2 w-1/2 text-xs font-semibold text-right truncate mt-2">
                        {/* {getDisconfortLabel(temp, hum)} */}
                        {room.disconfort}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
