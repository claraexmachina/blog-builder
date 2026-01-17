import { NextRequest, NextResponse } from 'next/server';
import { getAllDrafts, createDraft } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const drafts = getAllDrafts(session.userId);
  return NextResponse.json({ drafts });
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { title, content, thumbnail, categoryId } = data;

    const draft = createDraft({
      title: title || '제목 없음',
      content: content || '',
      thumbnail,
      categoryId,
      authorId: session.userId,
    });

    return NextResponse.json({ draft }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: '임시저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
