import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getOne, getAll, ensureInitialized } from '@/lib/database';

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

export async function GET(request: Request) {
  try {
    await ensureInitialized();
    const { userId, anonymousId } = extractUserId(request);

    let sessions;
    if (userId) {
      sessions = getAll(
        'SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 20',
        [userId]
      );
    } else if (anonymousId) {
      sessions = getAll(
        'SELECT * FROM chat_sessions WHERE anonymous_id = ? ORDER BY updated_at DESC LIMIT 10',
        [anonymousId]
      );
    } else {
      return NextResponse.json({ error: 'User ID or Anonymous ID required' }, { status: 400 });
    }

    const sessionsWithMessages = sessions.map((session: any) => {
      const messages = getAll(
        'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC',
        [session.id]
      );
      return { ...session, messages };
    });

    return NextResponse.json({ sessions: sessionsWithMessages });
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json({ error: 'Failed to get history' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureInitialized();
    const { userId, anonymousId } = extractUserId(request);
    const { sessionId } = await request.json();

    if (sessionId) {
      runQuery('DELETE FROM messages WHERE session_id = ?', [sessionId]);
      runQuery('DELETE FROM chat_sessions WHERE id = ?', [sessionId]);
    } else if (userId) {
      runQuery('DELETE FROM messages WHERE session_id IN (SELECT id FROM chat_sessions WHERE user_id = ?)', [userId]);
      runQuery('DELETE FROM chat_sessions WHERE user_id = ?', [userId]);
    } else if (anonymousId) {
      runQuery('DELETE FROM messages WHERE session_id IN (SELECT id FROM chat_sessions WHERE anonymous_id = ?)', [anonymousId]);
      runQuery('DELETE FROM chat_sessions WHERE anonymous_id = ?', [anonymousId]);
    }

    return NextResponse.json({ message: 'Chat cleared successfully' });
  } catch (error) {
    console.error('Clear error:', error);
    return NextResponse.json({ error: 'Failed to clear chat' }, { status: 500 });
  }
}

function runQuery(sql: string, params: any[] = []): void {
  const { runQuery: _runQuery } = require('@/lib/database');
  _runQuery(sql, params);
}
