import { getConfig, Room } from '@/utils/config';

export interface RoomData {
  name: string;
  temperature: number | null;
  humidity: number | null;
  indoor: boolean;
  disconfortIdx?: number | null;
  disconfort?: string | null;
  disconfortColor?: string | null;
  dewPoint?: number | null;
  moldRisk?: number | null;
  moldRiskColor?: string | null;
}

// export async function GET2() {
//   const config = getConfig();
//   const openhabUrl = config.openhab?.baseUrl || process.env.OPENHAB_BASE_URL || 'http://192.168.178.64:8080';
//   const rooms: Array<Room> | undefined = config.openhab?.rooms;

//   if (!rooms || rooms.length === 0) {
//     return Response.json({ rooms: [] });
//   }

//   try {
//     const roomsData = await Promise.all(
//       rooms.map(async (room: Room): Promise<RoomData> => {
//         const result: RoomData = {
//           name: room.name,
//           temperature: null,
//           humidity: null,
//           indoor: room.indoor,
//         };

//         // Fetch temperature
//         if (room.temperatureItem) {
//           try {
//             const res = await fetch(`${openhabUrl}/rest/items/${encodeURIComponent(room.temperatureItem)}`);
//             if (res.ok) {
//               const item = await res.json();
//               if (item?.state && item.state !== 'NULL' && item.state !== 'UNDEF') {
//                 result.temperature = parseFloat(item.state);
//               }
//             }
//           } catch (e) {
//             // ignore individual item errors
//           }
//         }

//         // Fetch humidity
//         if (room.humidityItem) {
//           try {
//             const res = await fetch(`${openhabUrl}/rest/items/${encodeURIComponent(room.humidityItem)}`);
//             if (res.ok) {
//               const item = await res.json();
//               if (item?.state && item.state !== 'NULL' && item.state !== 'UNDEF') {
//                 result.humidity = parseFloat(item.state);
//               }
//             }
//           } catch (e) {
//             // ignore individual item errors
//           }
//         }

//         return result;
//       })
//     );

//     return Response.json({ rooms: roomsData });
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//     return Response.json(
//       { error: 'Failed to fetch room data from OpenHab', details: errorMessage, rooms: [] },
//       { status: 500 }
//     );
//   }
// }

export async function GET() {
  const config = getConfig();
  const openhabUrl = config.openhab?.baseUrl || process.env.OPENHAB_BASE_URL || 'http://192.168.178.64:8080';
  const rooms: Array<Room> | undefined = config.openhab?.rooms;

  if (!rooms || rooms.length === 0) {
    return Response.json({ rooms: [] });
  }

  try {
    const roomsData = await Promise.all(
      rooms.map(async (room: Room): Promise<RoomData> => {
        const result: RoomData = {
          name: room.name,
          temperature: null,
          humidity: null,
          indoor: room.indoor,
          disconfortIdx: null,
          disconfort: null,
          disconfortColor: null,
          dewPoint: null,
          moldRisk: null,
          moldRiskColor: null,
        };

        // Fetch all room data
        if (room.itemname) {
          try {
            const res = await fetch(`${openhabUrl}/rest/items/${encodeURIComponent(room.itemname)}`);
            if (res.ok) {
              const item = await res.json();
              if (item){
                result.name = item.label || item.name;
                if (item.tags && item.tags.indexOf("Indoor") > -1){
                  result.indoor = true;
                } else {
                  result.indoor = false;
                }
                if (item.members){
                  for (const member of item.members){
                    if (member.tags && member.tags.length  > 0 && member.state && 
                      member.state !== 'NULL' && 
                      member.state !== 'UNDEF'){
                      if (
                        member.tags.indexOf("Temperature") > -1
                      ){
                        result.temperature = parseFloat(member.state);
                      }
                      if (
                        member.tags.indexOf("Humidity") > -1
                      ){
                        result.humidity = parseFloat(member.state);
                      }
                      if (
                        member.tags.indexOf("disconfortidx") > -1
                      ){
                        result.disconfortIdx = parseInt(member.state);
                      }
                      if (
                        member.tags.indexOf("disconfort") > -1
                      ){
                        result.disconfort = member.state;
                      }
                      if (
                        member.tags.indexOf("disconfortcolor") > -1
                      ){
                        result.disconfortColor = member.state;
                      }
                      if (
                        member.tags.indexOf("dewpoint") > -1
                      ){
                        result.dewPoint = parseFloat(member.state);
                      }
                      if (
                        member.tags.indexOf("moldrisk") > -1
                      ){
                        result.moldRisk = member.state;
                      }
                      if (
                        member.tags.indexOf("moldriskcolor") > -1
                      ){
                          // openhab return color as string, representing HSL, as example '123, 50, 50', but we need valid css color even hsla(...) format
                          result.moldRiskColor = member.state;
                      }
                  }
                  }
                }
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
