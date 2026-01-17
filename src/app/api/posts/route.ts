import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, createPost } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '0');
  const offset = parseInt(searchParams.get('offset') || '0');

  const session = await getSession();
  const publishedOnly = !session;

  let posts = await getAllPosts(publishedOnly);

  // Apply pagination
  if (limit > 0) {
    posts = posts.slice(offset, offset + limit);
  }

  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { title, content, excerpt, thumbnail, categoryId, published } = data;

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수입니다.' },
        { status: 400 }
      );
    }

    const post = await createPost({
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      thumbnail,
      categoryId,
      authorId: session.userId,
      published: published ?? true,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: '글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
