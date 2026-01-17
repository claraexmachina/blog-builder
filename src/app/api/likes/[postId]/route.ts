import { NextRequest, NextResponse } from 'next/server';
import { getLikeCount, hasLiked, addLike, removeLike, getPostById } from '@/lib/db';

function getVisitorId(request: NextRequest): string {
  // Try to get visitor ID from cookie, otherwise generate new one
  const visitorId = request.cookies.get('visitor-id')?.value;
  if (visitorId) return visitorId;

  // Generate a simple visitor ID based on IP and user agent
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return Buffer.from(`${ip}-${userAgent}`).toString('base64').substring(0, 32);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const post = getPostById(postId);

  if (!post) {
    return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 });
  }

  const visitorId = getVisitorId(request);
  const count = getLikeCount(postId);
  const liked = hasLiked(postId, visitorId);

  const response = NextResponse.json({ count, liked });

  // Set visitor ID cookie if not already set
  if (!request.cookies.get('visitor-id')) {
    response.cookies.set('visitor-id', visitorId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }

  return response;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const post = getPostById(postId);

  if (!post) {
    return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 });
  }

  const visitorId = getVisitorId(request);
  const alreadyLiked = hasLiked(postId, visitorId);

  let success: boolean;
  if (alreadyLiked) {
    success = removeLike(postId, visitorId);
  } else {
    success = addLike(postId, visitorId);
  }

  const count = getLikeCount(postId);
  const liked = !alreadyLiked;

  const response = NextResponse.json({ count, liked, success });

  // Set visitor ID cookie if not already set
  if (!request.cookies.get('visitor-id')) {
    response.cookies.set('visitor-id', visitorId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }

  return response;
}
