import { NextResponse } from 'next/server';
import { revalidatePhotos } from '@/actions/photos.action';
import getLogger from '@/utils/logger';

export async function POST(request: Request) {
  const logger = getLogger();
  try {
    await revalidatePhotos();
    logger.info('API /api/revalidate/photos SUCCESS');
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn('API /api/revalidate/photos failed: ' + message);
    if (err instanceof Error && err.stack) logger.debug(err.stack);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
