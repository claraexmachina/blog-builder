import { NextRequest, NextResponse } from 'next/server';
import { getDraftById, updateDraft, deleteDraft } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { id } = await params;
  const draft = getDraftById(id);

  if (!draft) {
    return NextResponse.json({ error: '임시저장을 찾을 수 없습니다.' }, { status: 404 });
  }

  if (draft.authorId !== session.userId) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  return NextResponse.json({ draft });
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
  const draft = getDraftById(id);

  if (!draft) {
    return NextResponse.json({ error: '임시저장을 찾을 수 없습니다.' }, { status: 404 });
  }

  if (draft.authorId !== session.userId) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  try {
    const data = await request.json();
    const { title, content, thumbnail, categoryId } = data;

    const updatedDraft = updateDraft(id, {
      title,
      content,
      thumbnail,
      categoryId,
    });

    return NextResponse.json({ draft: updatedDraft });
  } catch {
    return NextResponse.json(
      { error: '임시저장 수정 중 오류가 발생했습니다.' },
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
  const draft = getDraftById(id);

  if (!draft) {
    return NextResponse.json({ error: '임시저장을 찾을 수 없습니다.' }, { status: 404 });
  }

  if (draft.authorId !== session.userId) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  deleteDraft(id);
  return NextResponse.json({ success: true });
}
