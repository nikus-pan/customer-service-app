import { NextResponse } from 'next/server';
import { getAll, ensureInitialized } from '@/lib/database';

export async function GET() {
  try {
    await ensureInitialized();
    const products = getAll('SELECT * FROM products ORDER BY price ASC');

    const parsedProducts = products.map((p: any) => ({
      ...p,
      features: JSON.parse(p.features || '[]')
    }));

    return NextResponse.json({ products: parsedProducts });
  } catch (error) {
    console.error('Products error:', error);
    return NextResponse.json({ error: 'Failed to get products' }, { status: 500 });
  }
}
