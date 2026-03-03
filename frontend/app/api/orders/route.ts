import { NextResponse } from 'next/server';
import { runQuery, getOne, getAll, ensureInitialized } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    await ensureInitialized();
    const { userId, items, total } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '購物車是空的' }, { status: 400 });
    }

    const { v4: uuidv4 } = await import('uuid');
    const orderId = uuidv4();

    runQuery(
      'INSERT INTO orders (id, user_id, items, total, status) VALUES (?, ?, ?, ?, ?)',
      [orderId, userId || null, JSON.stringify(items), total, 'pending']
    );

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
    await ensureInitialized();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let orders;
    if (userId) {
      orders = getAll('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    } else {
      orders = getAll('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50');
    }

    const parsedOrders = orders.map((order: any) => ({
      ...order,
      items: JSON.parse(order.items || '[]')
    }));

    return NextResponse.json({ orders: parsedOrders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: '取得訂單失敗' }, { status: 500 });
  }
}
