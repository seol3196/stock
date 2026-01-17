import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'stock.db');
const db = new Database(dbPath);

// 데이터베이스 초기화
function initDatabase() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      interest_rate REAL DEFAULT 0.0
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      teacher_id TEXT NOT NULL,
      cash INTEGER DEFAULT 0,
      savings_balance INTEGER DEFAULT 0,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    );

    CREATE TABLE IF NOT EXISTS stocks (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      current_price INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    );

    CREATE TABLE IF NOT EXISTS stock_ownership (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      stock_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      average_buy_price INTEGER NOT NULL,
      UNIQUE(student_id, stock_id),
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (stock_id) REFERENCES stocks(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      stock_id TEXT NOT NULL,
      type TEXT NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (stock_id) REFERENCES stocks(id)
    );
  `);
}

// 앱 시작 시 DB 초기화
initDatabase();

export default db;

// UUID 생성 헬퍼
export function generateId() {
    return crypto.randomUUID();
}
