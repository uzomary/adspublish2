import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { rows } = await db.query(
      `SELECT image_url FROM banners WHERE id = $1 AND is_active = TRUE`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Banner not found or inactive' }, { status: 404 });
    }

    const imageUrl = rows[0].image_url;
    
    // Redirect to the actual image URL
    // We use a 302 redirect so that the browser doesn't cache it indefinitely
    return NextResponse.redirect(imageUrl, 302);
  } catch (error) {
    console.error('Error fetching banner image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
