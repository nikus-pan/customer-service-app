import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, ensureInitialized } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const { anonymousId } = await request.json();
    
    if (!anonymousId) {
      return NextResponse.json({ error: 'Anonymous ID is required' }, { status: 400 });
    }

    ensureInitialized();
    const db = getDatabase();
    let anonymousChat = db.prepare('SELECT * FROM anonymous_chats WHERE anonymous_id = ?').get(anonymousId) as any;

    if (!anonymousChat) {
      const id = uuidv4();
      db.prepare(`
        INSERT INTO anonymous_chats (id, anonymous_id, message_count)
        VALUES (?, ?, 0)
      `).run(id, anonymousId);
      anonymousChat = { id, anonymous_id: anonymousId, message_count: 0 };
    }

    return NextResponse.json({ 
      anonymousId: anonymousChat.anonymous_id, 
      messageCount: anonymousChat.message_count,
      shouldPromptRegister: anonymousChat.message_count >= 3
    });
  } catch (error) {
    console.error('Anonymous error:', error);
    return NextResponse.json({ error: 'Failed to process anonymous request' }, { status: 500 });
  }
}
