import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('price', { ascending: true });

    if (error) throw error;

    const products = data?.map(p => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
      published: p.published === 1
    })) || [];

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products error:', error);
    return NextResponse.json({ error: 'Failed to get products' }, { status: 500 });
  }
}
