import { getConfig } from '@/utils/config';

export async function GET() {
  const config = getConfig();
  const openhabUrl = config.openhab?.baseUrl || process.env.OPENHAB_BASE_URL || 'http://192.168.178.64:8080';
  const rooms = config.openhab?.rooms;

  if (!rooms || rooms.length === 0) {
    return Response.json({ rooms: [] });
  }

  try {
    const roomsData = await Promise.all(
      rooms.map(async (room: any) => {
        const result: any = {
          name: room.name,
          temperature: null,
          humidity: null,
        };

        // Fetch temperature
        if (room.temperatureItem) {
          try {
            const res = await fetch(`${openhabUrl}/rest/items/${encodeURIComponent(room.temperatureItem)}`);
            if (res.ok) {
              const item = await res.json();
              if (item?.state && item.state !== 'NULL' && item.state !== 'UNDEF') {
                result.temperature = parseFloat(item.state);
              }
            }
          } catch (e) {
            // ignore individual item errors
          }
        }

        // Fetch humidity
        if (room.humidityItem) {
          try {
            const res = await fetch(`${openhabUrl}/rest/items/${encodeURIComponent(room.humidityItem)}`);
            if (res.ok) {
              const item = await res.json();
              if (item?.state && item.state !== 'NULL' && item.state !== 'UNDEF') {
                result.humidity = parseFloat(item.state);
              }
            }
          } catch (e) {
            // ignore individual item errors
          }
        }

        return result;
      })
    );

    return Response.json({ rooms: roomsData });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      { error: 'Failed to fetch room data from OpenHab', details: errorMessage, rooms: [] },
      { status: 500 }
    );
  }
}
