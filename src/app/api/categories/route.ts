import { NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/db';

export async function GET() {
  const categories = getAllCategories();
  return NextResponse.json({ categories });
}
