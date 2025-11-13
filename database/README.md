# Database Schema

This directory contains the database schema and migration files for the application.

## Files Included in Git

The following files **should be committed** to version control:
- `schema.sql` - Main database schema file
- `migrations/001_initial_schema.sql` - Initial migration file
- `db.js` / `db.cjs` - Database connection and initialization code
- `models/*.js` / `models/*.cjs` - Database model files
- `auth.cjs` - Authentication service
- `index.js` - Database module exports

## Files NOT Included in Git

The following files **should NOT be committed** (they are in `.gitignore`):
- `*.db` - Actual database instance files
- `*.db-journal` - SQLite journal files
- `*.db-wal` - SQLite WAL (Write-Ahead Logging) files
- `*.db-shm` - SQLite shared memory files

## Setup

When cloning the repository, the database will be automatically created when the Electron app starts. The migration system will:
1. Check if migrations have been applied
2. Run `001_initial_schema.sql` if needed
3. Create the database in Electron's userData directory (not in this folder)

Each user will have their own database instance stored in their system's user data directory.

