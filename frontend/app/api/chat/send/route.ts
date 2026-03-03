import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, ensureInitialized } from '@/lib/database';
import { generateChatResponse } from '@/lib/gemini';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function extractUserId(request: Request): { userId?: string; anonymousId?: string } {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return { userId: decoded.userId };
    } catch {
      // Invalid token
    }
  }

  const anonymousId = request.headers.get('x-anonymous-id') || '';
  return { anonymousId };
}

export async function POST(request: Request) {
  try {
    const { message, sessionId } = await request.json();
    const { userId, anonymousId } = extractUserId(request);

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    ensureInitialized();
    const db = getDatabase();
    let currentSessionId = sessionId;

    if (!currentSessionId) {
      currentSessionId = uuidv4();
      db.prepare(`
        INSERT INTO chat_sessions (id, user_id, anonymous_id, title)
        VALUES (?, ?, ?, ?)
      `).run(currentSessionId, userId || null, anonymousId || null, message.substring(0, 50));
    }

    const userMessageId = uuidv4();
    db.prepare(`
      INSERT INTO messages (id, session_id, role, content)
      VALUES (?, ?, 'user', ?)
    `).run(userMessageId, currentSessionId, message);

    if (anonymousId) {
      const existing = db.prepare('SELECT * FROM anonymous_chats WHERE anonymous_id = ?').get(anonymousId) as any;
      if (existing) {
        db.prepare(`
          UPDATE anonymous_chats SET message_count = message_count + 1, last_chat_at = CURRENT_TIMESTAMP
          WHERE anonymous_id = ?
        `).run(anonymousId);
      }
    }

    const history = db.prepare(`
      SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 20
    `).all(currentSessionId) as { role: string; content: string }[];

    const response = await generateChatResponse(message, history);

    const botMessageId = uuidv4();
    db.prepare(`
      INSERT INTO messages (id, session_id, role, content)
      VALUES (?, ?, 'assistant', ?)
    `).run(botMessageId, currentSessionId, response);

    db.prepare(`
      UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(currentSessionId);

    let shouldPromptRegister = false;
    if (anonymousId) {
      const chat = db.prepare('SELECT message_count FROM anonymous_chats WHERE anonymous_id = ?').get(anonymousId) as { message_count: number };
      shouldPromptRegister = chat && chat.message_count >= 3;
    }

    return NextResponse.json({
      sessionId: currentSessionId,
      message: response,
      userId,
      anonymousId,
      shouldPromptRegister
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
