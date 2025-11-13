const { getDatabase } = require('../db.cjs');
const { randomUUID } = require('crypto');

/**
 * Session model - Session management functions
 */

/**
 * Create a new session
 * @param {Object} sessionData - Session data
 * @param {number} sessionData.userId - User ID
 * @param {Date|string} sessionData.expiresAt - Session expiration date
 * @param {string} [sessionData.ipAddress] - IP address (optional)
 * @param {string} [sessionData.userAgent] - User agent string (optional)
 * @returns {Object} Created session object
 */
function createSession({ userId, expiresAt, ipAddress = null, userAgent = null }) {
  const db = getDatabase();
  const sessionId = randomUUID();
  
  // Convert expiresAt to ISO string if it's a Date object
  const expiresAtString = expiresAt instanceof Date 
    ? expiresAt.toISOString() 
    : expiresAt;

  const stmt = db.prepare(
    'INSERT INTO sessions (id, user_id, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)'
  );

  stmt.run(sessionId, userId, expiresAtString, ipAddress, userAgent);
  
  return getSessionById(sessionId);
}

/**
 * Get session by ID
 * @param {string} sessionId - Session ID
 * @returns {Object|null} Session object or null if not found
 */
function getSessionById(sessionId) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
  const session = stmt.get(sessionId);
  return session || null;
}

/**
 * Get active session by ID (checks expiration)
 * @param {string} sessionId - Session ID
 * @returns {Object|null} Active session object or null if not found/expired
 */
function getActiveSessionById(sessionId) {
  const db = getDatabase();
  const stmt = db.prepare(
    'SELECT * FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP'
  );
  const session = stmt.get(sessionId);
  return session || null;
}

/**
 * Get all sessions for a user
 * @param {number} userId - User ID
 * @returns {Array} Array of session objects
 */
function getSessionsByUserId(userId) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId);
}

/**
 * Get active sessions for a user
 * @param {number} userId - User ID
 * @returns {Array} Array of active session objects
 */
function getActiveSessionsByUserId(userId) {
  const db = getDatabase();
  const stmt = db.prepare(
    'SELECT * FROM sessions WHERE user_id = ? AND expires_at > CURRENT_TIMESTAMP ORDER BY created_at DESC'
  );
  return stmt.all(userId);
}

/**
 * Update session expiration
 * @param {string} sessionId - Session ID
 * @param {Date|string} expiresAt - New expiration date
 * @returns {Object|null} Updated session object or null if not found
 */
function updateSessionExpiration(sessionId, expiresAt) {
  const db = getDatabase();
  
  // Convert expiresAt to ISO string if it's a Date object
  const expiresAtString = expiresAt instanceof Date 
    ? expiresAt.toISOString() 
    : expiresAt;

  const stmt = db.prepare('UPDATE sessions SET expires_at = ? WHERE id = ?');
  const result = stmt.run(expiresAtString, sessionId);
  
  if (result.changes > 0) {
    return getSessionById(sessionId);
  }
  return null;
}

/**
 * Delete session by ID
 * @param {string} sessionId - Session ID
 * @returns {boolean} True if session was deleted, false if not found
 */
function deleteSession(sessionId) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
  const result = stmt.run(sessionId);
  return result.changes > 0;
}

/**
 * Delete all sessions for a user
 * @param {number} userId - User ID
 * @returns {number} Number of sessions deleted
 */
function deleteAllUserSessions(userId) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM sessions WHERE user_id = ?');
  const result = stmt.run(userId);
  return result.changes;
}

/**
 * Delete expired sessions
 * @returns {number} Number of expired sessions deleted
 */
function deleteExpiredSessions() {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP');
  const result = stmt.run();
  return result.changes;
}

/**
 * Extend session expiration
 * @param {string} sessionId - Session ID
 * @param {number} additionalMinutes - Minutes to add to expiration
 * @returns {Object|null} Updated session object or null if not found
 */
function extendSession(sessionId, additionalMinutes) {
  const db = getDatabase();
  const stmt = db.prepare(
    'UPDATE sessions SET expires_at = datetime(expires_at, ? || " minutes") WHERE id = ?'
  );
  const result = stmt.run(`+${additionalMinutes}`, sessionId);
  
  if (result.changes > 0) {
    return getSessionById(sessionId);
  }
  return null;
}

/**
 * Check if session is valid (exists and not expired)
 * @param {string} sessionId - Session ID
 * @returns {boolean} True if session is valid, false otherwise
 */
function isSessionValid(sessionId) {
  const session = getActiveSessionById(sessionId);
  return !!session;
}

module.exports = {
  createSession,
  getSessionById,
  getActiveSessionById,
  getSessionsByUserId,
  getActiveSessionsByUserId,
  updateSessionExpiration,
  deleteSession,
  deleteAllUserSessions,
  deleteExpiredSessions,
  extendSession,
  isSessionValid
};

