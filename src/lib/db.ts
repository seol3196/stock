import Database from 'better-sqlite3';
import path from 'path';

// 전역 객체에 DB 인스턴스를 저장하여 HMR 시 재사용 (싱글톤)
const globalForDb = globalThis as unknown as {
  db: Database.Database | undefined;
};

const dbPath = path.join(process.cwd(), 'stock.db');

export const db = globalForDb.db ?? new Database(dbPath);

// 성능 및 동시성 향상을 위한 설정
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000'); // 5초 대기

// 스키마 초기화
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

// 최초 실행 시에만 초기화
if (!globalForDb.db) {
  initDatabase();
}

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}

export default db;

// UUID 생성 헬퍼 (호환성 확보)
export function generateId() {
  // Node 19+ or Browser
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
