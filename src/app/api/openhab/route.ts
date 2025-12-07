import { getConfig } from '@/utils/config';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fieldsParam = url.searchParams.get('fields');
  // load configuration (server-side) and map friendly field names to openhab item names
  const config = getConfig();
  const openhabUrl = config.openhab?.baseUrl || process.env.OPENHAB_BASE_URL || 'http://192.168.178.64:8080';
  const titleItem = config.openhab?.currentTitleItem || process.env.OPENHAB_CURRENT_TITLE_ITEM || 'livingroom_chromecast_title';
  const artistItem = config.openhab?.currentArtistItem || process.env.OPENHAB_CURRENT_ARTIST_ITEM || 'livingroom_chromecast_artist';
  const fieldMap: Record<string, string> = {
    title: titleItem,
    artist: artistItem,
  };

  try {
    // If client requested specific fields, fetch only those items (one request per item)
    if (fieldsParam) {
      const requested = fieldsParam.split(',').map((s) => s.trim()).filter(Boolean);

      // response object decoupled from OpenHab item names
      const responseObj: { title?: string; artist?: string } = {};

      for (const f of requested) {
        const itemName = fieldMap[f] || f; // allow passing full item name
        try {
          const res = await fetch(`${openhabUrl}/rest/items/${encodeURIComponent(itemName)}`);
          if (!res.ok) continue;
          const item = await res.json();

          // server-side null/undef checks
          if (!item || typeof item.state !== 'string') continue;
          const state = item.state;
          if (state === '' || state === 'NULL' || state === 'UNDEF') continue;

          // map openhab item to our canonical fields
          if (f === 'title' || item.name === fieldMap.title) {
            responseObj.title = state;
          }
          if (f === 'artist' || item.name === fieldMap.artist) {
            responseObj.artist = state;
          }
        } catch (e) {
          // ignore individual item errors and continue
          continue;
        }
      }

      return Response.json(responseObj);
    }

    // Fallback: return full items array (old behavior)
    const response = await fetch(`${openhabUrl}/rest/items`);
    if (!response.ok) {
      throw new Error(`OpenHab API error: ${response.status}`);
    }
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      { error: 'Failed to fetch from OpenHab', details: errorMessage },
      { status: 500 }
    );
  }
}
