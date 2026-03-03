import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDatabase, ensureInitialized } from '@/lib/database';

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
    const { userId, anonymousId } = extractUserId(request);

    ensureInitialized();
    const db = getDatabase();

    let sessions;
    if (userId) {
      sessions = db.prepare(`
        SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 20
      `).all(userId);
    } else if (anonymousId) {
      sessions = db.prepare(`
        SELECT * FROM chat_sessions WHERE anonymous_id = ? ORDER BY updated_at DESC LIMIT 10
      `).all(anonymousId);
    } else {
      return NextResponse.json({ error: 'User ID or Anonymous ID required' }, { status: 400 });
    }

    const sessionsWithMessages = (sessions as any[]).map(session => {
      const messages = db.prepare(`
        SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC
      `).all(session.id);
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
    const { userId, anonymousId } = extractUserId(request);
    const { sessionId } = await request.json();

    ensureInitialized();
    const db = getDatabase();

    if (sessionId) {
      db.prepare('DELETE FROM messages WHERE session_id = ?').run(sessionId);
      db.prepare('DELETE FROM chat_sessions WHERE id = ?').run(sessionId);
    } else if (userId) {
      db.prepare('DELETE FROM messages WHERE session_id IN (SELECT id FROM chat_sessions WHERE user_id = ?)').run(userId);
      db.prepare('DELETE FROM chat_sessions WHERE user_id = ?').run(userId);
    } else if (anonymousId) {
      db.prepare('DELETE FROM messages WHERE session_id IN (SELECT id FROM chat_sessions WHERE anonymous_id = ?)').run(anonymousId);
      db.prepare('DELETE FROM chat_sessions WHERE anonymous_id = ?').run(anonymousId);
    }

    return NextResponse.json({ message: 'Chat cleared successfully' });
  } catch (error) {
    console.error('Clear error:', error);
    return NextResponse.json({ error: 'Failed to clear chat' }, { status: 500 });
  }
}
