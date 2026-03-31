import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

// Transparent 1x1 GIF for the tracking pixel
const TRANSPARENT_GIF_BASE64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const transparentGifBuffer = Buffer.from(TRANSPARENT_GIF_BASE64, 'base64');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bannerId = searchParams.get('bannerId');

  if (!bannerId) {
    return new NextResponse(transparentGifBuffer, {
      status: 200,
      headers: { 'Content-Type': 'image/gif' },
    });
  }

  try {
    // 1. Fetch banner to get campaign_id
    const { rows } = await db.query(
      `SELECT campaign_id FROM banners WHERE id = $1 LIMIT 1`,
      [bannerId]
    );

    if (rows.length > 0) {
      const campaignId = rows[0].campaign_id;
      const id = randomUUID();
      const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
      const userAgent = request.headers.get('user-agent') ?? 'unknown';

      // 2. Log the impression event
      await db.query(
        `INSERT INTO tracking_events (id, type, banner_id, campaign_id, ip_address, user_agent, created_at) 
         VALUES ($1, 'IMPRESSION', $2, $3, $4, $5, NOW())`,
        [id, bannerId, campaignId, ipAddress, userAgent]
      );
    }

    // 3. Always return the pixel
    return new NextResponse(transparentGifBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*', // Critical for cross-site tracking
      },
    });

  } catch (error) {
    console.error('Error logging impression:', error);
    // Still return the pixel to avoid breaking the UI
    return new NextResponse(transparentGifBuffer, {
      status: 200,
      headers: { 'Content-Type': 'image/gif' },
    });
  }
}
