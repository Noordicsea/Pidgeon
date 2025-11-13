/**
 * Database module exports
 * Central export point for all database functionality
 */

// Database connection and initialization
export {
  initDatabase,
  getDatabase,
  closeDatabase,
  execSQL,
  prepare
} from './db.js';

// User model
export {
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
} from './models/user.js';

// Session model
export {
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
} from './models/session.js';

