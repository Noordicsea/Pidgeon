const Database = require('better-sqlite3');
const { join, dirname } = require('path');
const { readFileSync, existsSync, mkdirSync } = require('fs');

let db = null;

/**
 * Initialize the database connection
 * @param {string} dbPath - Optional custom database path. If not provided, uses Electron's userData directory
 * @param {Object} [electronApp] - Optional Electron app instance (for dependency injection/testing)
 * @returns {Database} SQLite database instance
 * @throws {Error} If database initialization fails
 */
function initDatabase(dbPath = null, electronApp = null) {
  if (db) {
    return db;
  }

  // Determine database path
  let databasePath;
  try {
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

    console.log(`Initializing database at: ${databasePath}`);

    // Ensure the directory exists (better-sqlite3 doesn't create directories)
    try {
      const dbDir = dirname(databasePath);
      console.log(`Database directory: ${dbDir}`);
      if (!existsSync(dbDir)) {
        console.log(`Creating database directory: ${dbDir}`);
        mkdirSync(dbDir, { recursive: true });
        console.log(`Created database directory: ${dbDir}`);
      } else {
        console.log(`Database directory already exists: ${dbDir}`);
      }
    } catch (error) {
      console.error(`Failed to create/verify database directory: ${error.message}`);
      throw new Error(`Failed to create database directory: ${error.message}`);
    }

    // Create database connection
    try {
      db = new Database(databasePath);
    } catch (error) {
      throw new Error(`Failed to create database connection at ${databasePath}: ${error.message}`);
    }

    // Enable foreign key constraints
    try {
      db.pragma('foreign_keys = ON');
    } catch (error) {
      db.close();
      db = null;
      throw new Error(`Failed to enable foreign keys: ${error.message}`);
    }

    // Run migrations
    try {
      console.log('Running database migrations...');
      runMigrations();
      console.log('Migrations completed successfully');
    } catch (error) {
      db.close();
      db = null;
      console.error('Migration error details:', error);
      throw new Error(`Failed to run migrations: ${error.message}`);
    }

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    // Ensure db is null if initialization failed
    if (db) {
      try {
        db.close();
      } catch (closeError) {
        // Ignore close errors
      }
      db = null;
    }
    // Re-throw with more context
    throw error;
  }
}

/**
 * Get the current database instance
 * @returns {Database} SQLite database instance
 * @throws {Error} If database is not initialized
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close the database connection
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Run database migrations
 * @throws {Error} If migration fails
 */
function runMigrations() {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    // Create migrations table to track applied migrations
    db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of applied migrations
    let appliedMigrations = [];
    try {
      appliedMigrations = db
        .prepare('SELECT name FROM migrations')
        .all()
        .map((row) => row.name);
    } catch (error) {
      // If query fails, assume no migrations applied yet
      console.log('Could not read migrations table, assuming no migrations applied');
      appliedMigrations = [];
    }

    // Run initial schema migration if not already applied
    const initialMigration = '001_initial_schema';
    if (!appliedMigrations.includes(initialMigration)) {
      const migrationPath = join(__dirname, 'migrations', `${initialMigration}.sql`);
      console.log(`Looking for migration file at: ${migrationPath}`);
      console.log(`__dirname is: ${__dirname}`);
      
      if (existsSync(migrationPath)) {
        console.log(`Running migration: ${initialMigration}`);
        try {
          const migrationSQL = readFileSync(migrationPath, 'utf8');
          
          // Execute migration in a transaction
          const transaction = db.transaction(() => {
            db.exec(migrationSQL);
            db.prepare('INSERT INTO migrations (name) VALUES (?)').run(initialMigration);
          });
          
          transaction();
          console.log(`Migration ${initialMigration} applied successfully`);
        } catch (error) {
          throw new Error(`Failed to execute migration ${initialMigration}: ${error.message}`);
        }
      } else {
        // Fallback: execute schema.sql if migration file doesn't exist
        const schemaPath = join(__dirname, 'schema.sql');
        console.log(`Migration file not found, trying schema.sql at: ${schemaPath}`);
        if (existsSync(schemaPath)) {
          console.log(`Running schema.sql fallback`);
          try {
            const schemaSQL = readFileSync(schemaPath, 'utf8');
            db.exec(schemaSQL);
            db.prepare('INSERT INTO migrations (name) VALUES (?)').run(initialMigration);
            console.log('Schema.sql applied successfully');
          } catch (error) {
            throw new Error(`Failed to execute schema.sql: ${error.message}`);
          }
        } else {
          const errorMsg = `Neither migration file (${migrationPath}) nor schema.sql (${schemaPath}) found. ` +
            `Current directory: ${__dirname}`;
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
      }
    } else {
      console.log(`Migration ${initialMigration} already applied`);
    }
  } catch (error) {
    throw new Error(`Migration failed: ${error.message}`);
  }
}

/**
 * Execute a raw SQL query (use with caution)
 * @param {string} sql - SQL query to execute
 * @returns {object} Query result
 */
function execSQL(sql) {
  const database = getDatabase();
  return database.exec(sql);
}

/**
 * Prepare a SQL statement for execution
 * @param {string} sql - SQL statement to prepare
 * @returns {Statement} Prepared statement
 */
function prepare(sql) {
  const database = getDatabase();
  return database.prepare(sql);
}

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase,
  execSQL,
  prepare
};

