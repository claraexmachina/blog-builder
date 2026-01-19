import { NextResponse } from 'next/server';

export async function GET() {
  const gifUrl = 'https://pixelsafari.neocities.org/favicon/animals/cat/cat61.gif';

  try {
    const response = await fetch(gifUrl);
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch favicon' }, { status: 500 });
  }
}
