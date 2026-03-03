import { NextResponse } from 'next/server';
import { searchSOP } from '@/lib/rag';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
      return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
    }

    const results = searchSOP(q);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('SOP search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
