import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// SQLite database file path
const DB_PATH = path.join(process.cwd(), 'database', 'stockmaster.db');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

/**
 * SQLite database connection
 */
const db = new Database(DB_PATH, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('✅ Connected to SQLite database:', DB_PATH);

/**
 * Execute a query with parameters (SELECT queries)
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    // Convert PostgreSQL $1, $2 syntax to SQLite ? syntax
    const sqliteQuery = text.replace(/\$(\d+)/g, '?');
    
    // Determine if it's a SELECT query
    const isSelect = sqliteQuery.trim().toUpperCase().startsWith('SELECT');
    
    let result;
    if (isSelect) {
      const stmt = db.prepare(sqliteQuery);
      const rows = params ? stmt.all(...params) : stmt.all();
      result = {
        rows: rows,
        rowCount: rows.length,
      };
    } else {
      // INSERT, UPDATE, DELETE
      const stmt = db.prepare(sqliteQuery);
      const info = params ? stmt.run(...params) : stmt.run();
      
      // For INSERT with RETURNING, we need to fetch the last inserted row
      if (sqliteQuery.toUpperCase().includes('RETURNING')) {
        const returningMatch = sqliteQuery.match(/RETURNING\s+(.+?)(?:;|$)/i);
        if (returningMatch && info.lastInsertRowid) {
          const columns = returningMatch[1].trim().split(',').map(c => c.trim());
          const tableName = sqliteQuery.match(/(?:INSERT INTO|UPDATE|DELETE FROM)\s+(\w+)/i)?.[1];
          if (tableName) {
            const selectStmt = db.prepare(`SELECT ${columns.join(', ')} FROM ${tableName} WHERE rowid = ?`);
            const row = selectStmt.get(info.lastInsertRowid);
            result = {
              rows: row ? [row] : [],
              rowCount: 1,
            };
          } else {
            result = { rows: [], rowCount: info.changes };
          }
        } else {
          result = { rows: [], rowCount: info.changes };
        }
      } else {
        result = {
          rows: [],
          rowCount: info.changes,
        };
      }
    }
    
    const duration = Date.now() - start;
    console.log('Executed query', { duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Get a transaction client
 */
export const getClient = async () => {
  return {
    query: async (text: string, params?: any[]) => {
      return query(text, params);
    },
    release: () => {
      // No-op for SQLite (no connection pooling)
    },
  };
};

/**
 * Close database connection
 */
export const closePool = async () => {
  db.close();
  console.log('Database connection closed');
};

/**
 * Initialize database schema
 */
export const initDatabase = () => {
  console.log('Initializing database schema...');
  
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // OTP verifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      otp TEXT NOT NULL,
      type TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Warehouses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS warehouses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      manager TEXT,
      contact TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      unit_price REAL NOT NULL,
      reorder_point INTEGER DEFAULT 0,
      total_stock INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Operations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS operations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      reference TEXT UNIQUE NOT NULL,
      product_id INTEGER,
      from_warehouse_id INTEGER,
      to_warehouse_id INTEGER,
      quantity INTEGER NOT NULL,
      unit_price REAL,
      total_value REAL,
      status TEXT DEFAULT 'pending',
      reason TEXT,
      notes TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (from_warehouse_id) REFERENCES warehouses(id),
      FOREIGN KEY (to_warehouse_id) REFERENCES warehouses(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `);

  // Stock moves table
  db.exec(`
    CREATE TABLE IF NOT EXISTS stock_moves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      warehouse_id INTEGER NOT NULL,
      operation_id INTEGER,
      quantity INTEGER NOT NULL,
      movement_type TEXT NOT NULL,
      balance_after INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
      FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE
    );
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_operations_type ON operations(type);
    CREATE INDEX IF NOT EXISTS idx_operations_status ON operations(status);
    CREATE INDEX IF NOT EXISTS idx_operations_product ON operations(product_id);
    CREATE INDEX IF NOT EXISTS idx_stock_moves_product ON stock_moves(product_id);
    CREATE INDEX IF NOT EXISTS idx_stock_moves_warehouse ON stock_moves(warehouse_id);
    CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email);
  `);

  // Insert sample data if tables are empty
  const warehouseCount = db.prepare('SELECT COUNT(*) as count FROM warehouses').get() as { count: number };
  
  if (warehouseCount.count === 0) {
    console.log('Inserting sample data...');
    
    // Insert warehouses
    db.prepare(`
      INSERT INTO warehouses (name, location, capacity, manager, contact) VALUES
      ('Main Warehouse', 'New York, NY', 10000, 'John Smith', '+1-555-0101'),
      ('West Coast Hub', 'Los Angeles, CA', 8000, 'Sarah Johnson', '+1-555-0102'),
      ('East Distribution', 'Boston, MA', 6000, 'Mike Wilson', '+1-555-0103')
    `).run();

    // Insert products
    db.prepare(`
      INSERT INTO products (sku, name, category, description, unit_price, reorder_point) VALUES
      ('LAPTOP-001', 'Dell XPS 15', 'Electronics', 'High-performance laptop', 1299.99, 10),
      ('MOUSE-001', 'Logitech MX Master', 'Electronics', 'Wireless mouse', 99.99, 50),
      ('DESK-001', 'Standing Desk Pro', 'Furniture', 'Adjustable height desk', 599.99, 5),
      ('CHAIR-001', 'Ergonomic Office Chair', 'Furniture', 'Comfortable office seating', 399.99, 8),
      ('MONITOR-001', 'Samsung 27" 4K', 'Electronics', '4K display monitor', 449.99, 15)
    `).run();

    console.log('✅ Sample data inserted');
  }

  console.log('✅ Database initialized successfully');
};

// Initialize on module load
initDatabase();

export default db;
