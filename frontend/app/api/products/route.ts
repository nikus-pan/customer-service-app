import { NextResponse } from 'next/server';
import { getDatabase, ensureInitialized } from '@/lib/database';

export async function GET() {
  try {
    ensureInitialized();
    const db = getDatabase();
    const products = db.prepare('SELECT * FROM products ORDER BY price ASC').all();

    const parsedProducts = (products as any[]).map(p => ({
      ...p,
      features: JSON.parse(p.features || '[]')
    }));

    return NextResponse.json({ products: parsedProducts });
  } catch (error) {
    console.error('Products error:', error);
    return NextResponse.json({ error: 'Failed to get products' }, { status: 500 });
  }
}
