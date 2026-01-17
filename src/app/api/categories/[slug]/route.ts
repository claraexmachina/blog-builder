import { NextRequest, NextResponse } from 'next/server';
import { getCategoryBySlug, getPostsByCategory } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '0');
  const offset = parseInt(searchParams.get('offset') || '0');

  const category = await getCategoryBySlug(slug);

  if (!category) {
    return NextResponse.json(
      { error: '카테고리를 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  const session = await getSession();
  const publishedOnly = !session;

  let posts = await getPostsByCategory(category.id, publishedOnly);

  // Apply pagination
  if (limit > 0) {
    posts = posts.slice(offset, offset + limit);
  }

  return NextResponse.json({ category, posts });
}
