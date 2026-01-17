import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, createCategory } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  const categories = await getAllCategories();
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  // Check authentication
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, slug } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const category = await createCategory(name, slug);
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
