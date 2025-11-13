const bcrypt = require('bcryptjs');
const { 
  createUser, 
  getUserByEmail, 
  updateLastLogin,
  emailExists,
  getUserById
} = require('./models/user.cjs');
const { 
  createSession, 
  getActiveSessionById,
  deleteSession 
} = require('./models/session.cjs');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User's email
 * @param {string} userData.password - Plain text password
 * @param {string} userData.name - User's full name
 * @returns {Object} Created user object (without password_hash)
 */
async function registerUser({ email, password, name }) {
  // Check if email already exists
  if (emailExists(email)) {
    throw new Error('Email already exists');
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Create user
  const user = createUser({ email, password_hash, name });
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    created_at: user.created_at
  };
}

/**
 * Authenticate user login
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - Plain text password
 * @returns {Object} Session data with user info
 */
async function loginUser({ email, password }) {
  // Get user by email (includes password_hash)
  const user = getUserByEmail(email);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if user is active
  if (!user.is_active) {
    throw new Error('Account is inactive');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Update last login
  updateLastLogin(user.id);

  // Create session (expires in 7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  const session = createSession({
    userId: user.id,
    expiresAt: expiresAt.toISOString(),
    ipAddress: null, // Could get from request if needed
    userAgent: null  // Could get from request if needed
  });

  return {
    sessionId: session.id,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      last_login: user.last_login
    },
    expiresAt: session.expires_at
  };
}

/**
 * Get current session and user info
 * @param {string} sessionId - Session ID
 * @returns {Object|null} Session data with user info or null
 */
function getCurrentSession(sessionId) {
  if (!sessionId) {
    return null;
  }

  const session = getActiveSessionById(sessionId);
  
  if (!session) {
    return null;
  }

  // Get user info
  const user = getUserById(session.user_id);
  
  if (!user) {
    return null;
  }

  return {
    sessionId: session.id,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      last_login: user.last_login
    },
    expiresAt: session.expires_at
  };
}

/**
 * Logout user by deleting session
 * @param {string} sessionId - Session ID to delete
 * @returns {boolean} True if session was deleted
 */
function logoutUser(sessionId) {
  if (!sessionId) {
    return false;
  }
  
  return deleteSession(sessionId);
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentSession,
  logoutUser
};

