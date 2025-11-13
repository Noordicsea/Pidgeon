const { getDatabase } = require('../db.cjs');

/**
 * User model - CRUD operations for user accounts
 */

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {string} userData.email - User's email address
 * @param {string} userData.password_hash - Hashed password
 * @param {string} userData.name - User's full name
 * @returns {Object} Created user object (without password_hash)
 */
function createUser({ email, password_hash, name }) {
  const db = getDatabase();
  const stmt = db.prepare(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
  );

  try {
    const result = stmt.run(email, password_hash, name);
    return getUserById(result.lastInsertRowid);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Object|null} User object or null if not found
 */
function getUserById(id) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT id, email, name, created_at, updated_at, is_active, last_login FROM users WHERE id = ?');
  const user = stmt.get(id);
  return user || null;
}

/**
 * Get user by email
 * @param {string} email - User's email address
 * @returns {Object|null} User object (including password_hash) or null if not found
 */
function getUserByEmail(email) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email);
  return user || null;
}

/**
 * Get user by email (without password hash) - for public user info
 * @param {string} email - User's email address
 * @returns {Object|null} User object (without password_hash) or null if not found
 */
function getUserByEmailPublic(email) {
  const db = getDatabase();
  const stmt = db.prepare(
    'SELECT id, email, name, created_at, updated_at, is_active, last_login FROM users WHERE email = ?'
  );
  const user = stmt.get(email);
  return user || null;
}

/**
 * Update user information
 * @param {number} id - User ID
 * @param {Object} updates - Fields to update
 * @param {string} [updates.email] - New email address
 * @param {string} [updates.password_hash] - New password hash
 * @param {string} [updates.name] - New name
 * @param {boolean} [updates.is_active] - Active status
 * @returns {Object|null} Updated user object or null if not found
 */
function updateUser(id, updates) {
  const db = getDatabase();
  const allowedFields = ['email', 'password_hash', 'name', 'is_active'];
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    return getUserById(id);
  }

  values.push(id);
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  const stmt = db.prepare(sql);

  try {
    stmt.run(...values);
    return getUserById(id);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

/**
 * Update user's last login timestamp
 * @param {number} id - User ID
 */
function updateLastLogin(id) {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(id);
}

/**
 * Delete user by ID
 * @param {number} id - User ID
 * @returns {boolean} True if user was deleted, false if not found
 */
function deleteUser(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * Check if email exists
 * @param {string} email - Email address to check
 * @returns {boolean} True if email exists, false otherwise
 */
function emailExists(email) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT 1 FROM users WHERE email = ? LIMIT 1');
  const result = stmt.get(email);
  return !!result;
}

/**
 * Get all users (for admin purposes)
 * @param {Object} options - Query options
 * @param {number} [options.limit] - Maximum number of results
 * @param {number} [options.offset] - Number of results to skip
 * @returns {Array} Array of user objects (without password_hash)
 */
function getAllUsers({ limit = 100, offset = 0 } = {}) {
  const db = getDatabase();
  const stmt = db.prepare(
    'SELECT id, email, name, created_at, updated_at, is_active, last_login FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?'
  );
  return stmt.all(limit, offset);
}

/**
 * Create or update recovery key for a user
 * @param {number} userId - User ID
 * @param {string} recoveryPhraseHash - Hashed recovery phrase
 * @returns {Object} Recovery key object
 */
function setRecoveryKey(userId, recoveryPhraseHash) {
  const db = getDatabase();
  
  // Check if recovery key already exists
  const existing = db.prepare('SELECT id FROM recovery_keys WHERE user_id = ?').get(userId);
  
  if (existing) {
    // Update existing recovery key
    const stmt = db.prepare(
      'UPDATE recovery_keys SET recovery_phrase_hash = ?, created_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    );
    stmt.run(recoveryPhraseHash, userId);
  } else {
    // Create new recovery key
    const stmt = db.prepare(
      'INSERT INTO recovery_keys (user_id, recovery_phrase_hash) VALUES (?, ?)'
    );
    stmt.run(userId, recoveryPhraseHash);
  }
  
  return getRecoveryKey(userId);
}

/**
 * Get recovery key for a user
 * @param {number} userId - User ID
 * @returns {Object|null} Recovery key object or null if not found
 */
function getRecoveryKey(userId) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM recovery_keys WHERE user_id = ?');
  return stmt.get(userId) || null;
}

/**
 * Verify recovery phrase and update last_used timestamp
 * @param {number} userId - User ID
 * @returns {boolean} True if recovery key exists, false otherwise
 */
function markRecoveryKeyUsed(userId) {
  const db = getDatabase();
  const stmt = db.prepare(
    'UPDATE recovery_keys SET last_used = CURRENT_TIMESTAMP WHERE user_id = ?'
  );
  const result = stmt.run(userId);
  return result.changes > 0;
}

/**
 * Delete recovery key for a user
 * @param {number} userId - User ID
 * @returns {boolean} True if recovery key was deleted, false if not found
 */
function deleteRecoveryKey(userId) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM recovery_keys WHERE user_id = ?');
  const result = stmt.run(userId);
  return result.changes > 0;
}

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getUserByEmailPublic,
  updateUser,
  updateLastLogin,
  deleteUser,
  emailExists,
  getAllUsers,
  setRecoveryKey,
  getRecoveryKey,
  markRecoveryKeyUsed,
  deleteRecoveryKey
};

