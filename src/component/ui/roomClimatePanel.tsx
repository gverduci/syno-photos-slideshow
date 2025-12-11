'use client';

import { useEffect, useState } from 'react';
import logger from '@/utils/loggerBrowser';

interface RoomData {
  name: string;
  temperature: number | null;
  humidity: number | null;
}

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
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg transition-all"
        aria-label="Toggle climate panel"
      >
        <svg
          className="w-6 h-6"
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
        <div className="absolute top-16 right-0 bg-gray-900 text-white rounded-lg shadow-2xl p-4 w-80 border border-gray-700">
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
              {rooms.map((room) => (
                <div
                  key={room.name}
                  className="bg-gray-800 rounded-lg p-3 border border-gray-700"
                >
                  <h4 className="font-medium text-sm mb-2 capitalize">
                    {room.name}
                  </h4>
                  <div className="flex justify-between text-sm">
                    {room.temperature !== null && (
                      <div className="flex items-center">
                        <span className="text-orange-400">🌡️</span>
                        <span className="ml-1">
                          {room.temperature.toFixed(1)}°C
                        </span>
                      </div>
                    )}
                    {room.humidity !== null && (
                      <div className="flex items-center">
                        <span className="text-blue-400">💧</span>
                        <span className="ml-1">
                          {room.humidity.toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
