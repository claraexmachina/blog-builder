import { NextRequest, NextResponse } from 'next/server';
import { updateCategory, deleteCategory } from '@/lib/db';
import { cookies } from 'next/headers';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { name, slug } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const category = await updateCategory(id, name, slug);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const success = await deleteCategory(id);
    if (!success) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
