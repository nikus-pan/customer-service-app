import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

let db: SqlJsDatabase | null = null;
let dbPath: string = '';

export async function initDatabase(): Promise<void> {
  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  dbPath = path.join(dataDir, 'customer.db');

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'free',
      anonymous_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      anonymous_id TEXT,
      title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      category TEXT,
      features TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS anonymous_chats (
      id TEXT PRIMARY KEY,
      anonymous_id TEXT NOT NULL,
      message_count INTEGER DEFAULT 0,
      last_chat_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  initProducts(db);
  saveDatabase();
  console.log('Database initialized successfully');
}

function initProducts(db: SqlJsDatabase): void {
  const result = db.exec('SELECT COUNT(*) as count FROM products');
  const count = result.length > 0 ? result[0].values[0][0] : 0;

  if (count === 0) {
    const products = [
      {
        id: uuidv4(),
        name: '智慧客服系統 Enterprise',
        description: '全方位企業客服解決方案，支援 AI 對話、多管道整合、數據分析。適合中大型企業使用。',
        price: 49900,
        image: '/images/product-1.png',
        category: '軟體',
        features: JSON.stringify(['AI 智慧對話', '多管道整合', '數據儀表板', 'API 串接', '優先客服支援'])
      },
      {
        id: uuidv4(),
        name: '智慧客服系統 Pro',
        description: '專業級客服系統，適合小型企業。內建 RAG 知識庫與基礎分析功能。',
        price: 19900,
        image: '/images/product-2.png',
        category: '軟體',
        features: JSON.stringify(['AI 對話', 'RAG 知識庫', '基礎分析', 'email 支援'])
      },
      {
        id: uuidv4(),
        name: '客服系統 Starter',
        description: '入門級客服系統，適合新創公司與個人工作室。',
        price: 4900,
        image: '/images/product-3.png',
        category: '軟體',
        features: JSON.stringify(['基本對話', '產品目錄', 'Email 支援'])
      },
      {
        id: uuidv4(),
        name: 'RAG 知識庫擴充套件',
        description: '增強 RAG 功能，支援更多文件格式與進階搜尋。',
        price: 9900,
        image: '/images/product-4.png',
        category: '擴充套件',
        features: JSON.stringify(['PDF 支援', 'Word 支援', '進階搜尋', '語意分析'])
      },
      {
        id: uuidv4(),
        name: '多管道整合模組',
        description: '整合 LINE、Facebook、Instagram 等社群媒體管道。',
        price: 12900,
        image: '/images/product-5.png',
        category: '擴充套件',
        features: JSON.stringify(['LINE 整合', 'FB 整合', 'IG 整合', '統一收件匣'])
      },
      {
        id: uuidv4(),
        name: '企業訓練課程',
        description: '專業客服團隊訓練課程，包含 AI 系統使用與優化策略。',
        price: 25000,
        image: '/images/product-6.png',
        category: '服務',
        features: JSON.stringify(['線上課程', '實作工作坊', '認證證書', '一年內免費更新'])
      }
    ];

    for (const product of products) {
      db.run(
        `INSERT INTO products (id, name, description, price, image, category, features) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [product.id, product.name, product.description, product.price, product.image, product.category, product.features]
      );
    }

    console.log('Products initialized');
  }
}

export function saveDatabase(): void {
  if (db && dbPath) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

export function getDatabase(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function runQuery(sql: string, params: any[] = []): any {
  const database = getDatabase();
  database.run(sql, params);
  saveDatabase();
}

export function getOne(sql: string, params: any[] = []): any {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

export function getAll(sql: string, params: any[] = []): any[] {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

let initialized = false;
export async function ensureInitialized(): Promise<void> {
  if (!initialized) {
    await initDatabase();
    initialized = true;
  }
}
