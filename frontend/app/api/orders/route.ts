import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { userId, items, total, discount = 0, user_email } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '購物車是空的' }, { status: 400 });
    }

    const orderId = 'order_' + Date.now();

    const { error } = await supabase.from('orders').insert([{
      id: orderId,
      user_id: userId || null,
      user_email: user_email || null,
      items: JSON.stringify(items),
      total,
      discount,
      status: 'pending',
      shipping_status: 'pending'
    }]);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      orderId,
      message: '訂單已建立' 
    });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json({ error: '建立訂單失敗' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const orders = data?.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    })) || [];

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: '取得訂單失敗' }, { status: 500 });
  }
}
