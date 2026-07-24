import { getConfig } from '@/utils/config';
import { getItemThumbnailUrlByCacheKey } from '@/utils/utils';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cacheKey = url.searchParams.get('cache_key');
  const token = url.searchParams.get('token');
  const sid = url.searchParams.get('sid');

  if (!cacheKey || !token || !sid) {
    return NextResponse.json(
      { error: 'Missing required parameters: cache_key, token, sid' },
      { status: 400 }
    );
  }

  const config = getConfig();
  const thumbnailUrl = getItemThumbnailUrlByCacheKey(cacheKey, token, sid, config);

  try {
    const res = await fetch(thumbnailUrl, { cache: 'no-store' });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Synology API error: ${res.status} ${res.statusText}` },
        { status: res.status }
      );
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';

    return new Response(res.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch thumbnail: ${error}` },
      { status: 500 }
    );
  }
}
