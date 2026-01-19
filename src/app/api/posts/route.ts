import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, createPost } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Strip markdown syntax to create plain text excerpt
function stripMarkdown(text: string): string {
  return text
    // Remove images ![alt](url)
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove links [text](url) -> text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Remove bold/italic **text** or *text* or __text__ or _text_
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]*)`/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove extra whitespace
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

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
      excerpt: excerpt || stripMarkdown(content).substring(0, 150) + '...',
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
