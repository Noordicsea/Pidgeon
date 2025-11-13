import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

let db = null;

/**
 * Initialize the database connection
 * @param {string} dbPath - Optional custom database path. If not provided, uses Electron's userData directory
 * @param {Object} [electronApp] - Optional Electron app instance (for dependency injection/testing)
 * @returns {Database} SQLite database instance
 */
export function initDatabase(dbPath = null, electronApp = null) {
  if (db) {
    return db;
  }

  // Determine database path
  let databasePath;
  if (dbPath) {
    databasePath = dbPath;
  } else {
    // Use Electron's userData directory for production
    // Fallback to project directory for development/testing
    let app = electronApp;
    if (!app) {
      try {
        // Try to get electron app - this works when called from Electron main process
        const electron = require('electron');
        app = electron.app;
      } catch (error) {
        // Electron not available (e.g., during testing) - use fallback path
        app = null;
      }
    }
    
    if (app && typeof app.getPath === 'function') {
      try {
        const userDataPath = app.getPath('userData');
        databasePath = join(userDataPath, 'database.db');
      } catch (error) {
        // Fallback if getPath fails
        databasePath = join(__dirname, '..', 'database.db');
      }
    } else {
      // Fallback if Electron app is not available (e.g., during testing)
      databasePath = join(__dirname, '..', 'database.db');
    }
  }

  // Create database connection
  db = new Database(databasePath);

  // Enable foreign key constraints
  db.pragma('foreign_keys = ON');

  // Run migrations
  runMigrations();

  return db;
}

/**
 * Get the current database instance
 * @returns {Database} SQLite database instance
 * @throws {Error} If database is not initialized
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Run database migrations
 */
function runMigrations() {
  if (!db) {
    throw new Error('Database not initialized');
  }

  // Create migrations table to track applied migrations
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get list of applied migrations
  const appliedMigrations = db
    .prepare('SELECT name FROM migrations')
    .all()
    .map((row) => row.name);

  // Run initial schema migration if not already applied
  const initialMigration = '001_initial_schema';
  if (!appliedMigrations.includes(initialMigration)) {
    const migrationPath = join(__dirname, 'migrations', `${initialMigration}.sql`);
    
    if (existsSync(migrationPath)) {
      const migrationSQL = readFileSync(migrationPath, 'utf8');
      
      // Execute migration in a transaction
      const transaction = db.transaction(() => {
        db.exec(migrationSQL);
        db.prepare('INSERT INTO migrations (name) VALUES (?)').run(initialMigration);
      });
      
      transaction();
    } else {
      // Fallback: execute schema.sql if migration file doesn't exist
      const schemaPath = join(__dirname, 'schema.sql');
      if (existsSync(schemaPath)) {
        const schemaSQL = readFileSync(schemaPath, 'utf8');
        db.exec(schemaSQL);
        db.prepare('INSERT INTO migrations (name) VALUES (?)').run(initialMigration);
      }
    }
  }
}

/**
 * Execute a raw SQL query (use with caution)
 * @param {string} sql - SQL query to execute
 * @returns {object} Query result
 */
export function execSQL(sql) {
  const database = getDatabase();
  return database.exec(sql);
}

/**
 * Prepare a SQL statement for execution
 * @param {string} sql - SQL statement to prepare
 * @returns {Statement} Prepared statement
 */
export function prepare(sql) {
  const database = getDatabase();
  return database.prepare(sql);
}

