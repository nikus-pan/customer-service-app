import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getOne, getAll, ensureInitialized } from '@/lib/database';
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
    await ensureInitialized();
    const { message, sessionId } = await request.json();
    const { userId, anonymousId } = extractUserId(request);

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let currentSessionId = sessionId;

    if (!currentSessionId) {
      currentSessionId = uuidv4();
      runQuery(
        'INSERT INTO chat_sessions (id, user_id, anonymous_id, title) VALUES (?, ?, ?, ?)',
        [currentSessionId, userId || null, anonymousId || null, message.substring(0, 50)]
      );
    }

    const userMessageId = uuidv4();
    runQuery(
      'INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
      [userMessageId, currentSessionId, 'user', message]
    );

    if (anonymousId) {
      const existing = getOne('SELECT * FROM anonymous_chats WHERE anonymous_id = ?', [anonymousId]);
      if (existing) {
        runQuery(
          'UPDATE anonymous_chats SET message_count = message_count + 1, last_chat_at = CURRENT_TIMESTAMP WHERE anonymous_id = ?',
          [anonymousId]
        );
      }
    }

    const history = getAll(
      'SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 20',
      [currentSessionId]
    );

    const response = await generateChatResponse(message, history);

    const botMessageId = uuidv4();
    runQuery(
      'INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
      [botMessageId, currentSessionId, 'assistant', response]
    );

    runQuery(
      'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [currentSessionId]
    );

    let shouldPromptRegister = false;
    if (anonymousId) {
      const chat = getOne('SELECT message_count FROM anonymous_chats WHERE anonymous_id = ?', [anonymousId]);
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
