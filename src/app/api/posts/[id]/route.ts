import { NextRequest, NextResponse } from 'next/server';
import { getPostById, updatePost, deletePost } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 });
  }

  const session = await getSession();

  // Non-authenticated users can only see published posts
  if (!post.published && !session) {
    return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const data = await request.json();

    // Only include fields that are explicitly provided (not undefined)
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.published !== undefined) updateData.published = data.published;

    const updatedPost = await updatePost(id, updateData);

    if (!updatedPost) {
      return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ post: updatedPost });
  } catch {
    return NextResponse.json(
      { error: '글 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { id } = await params;
  const success = await deletePost(id);

  if (!success) {
    return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
