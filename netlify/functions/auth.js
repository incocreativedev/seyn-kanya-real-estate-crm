const { query, createResponse, handleOptions, initializeTables } = require('./utils/database');
const crypto = require('crypto');

exports.handler = async (event) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // Initialize tables on first request
  try {
    await initializeTables();
    await initializeUserTable();
  } catch (error) {
    console.error('Failed to initialize tables:', error);
  }

  const { httpMethod, body } = event;

  try {
    switch (httpMethod) {
      case 'POST':
        const requestBody = JSON.parse(body);
        
        // Determine action based on request body content
        if (requestBody.fullName) {
          // Registration request
          return await registerUser(requestBody);
        } else if (requestBody.token && !requestBody.email) {
          // Token verification request
          return await verifyToken(requestBody);
        } else if (requestBody.email && requestBody.password) {
          // Login request
          return await loginUser(requestBody);
        } else {
          return createResponse(400, { error: 'Invalid request format' });
        }
        
      case 'GET':
        return await getUserProfile(event.headers);
        
      default:
        return createResponse(405, { error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Auth API Error:', error);
    return createResponse(500, { error: 'Internal server error', details: error.message });
  }
};

// Initialize users table
async function initializeUserTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      role VARCHAR(50) DEFAULT 'agent',
      is_active BOOLEAN DEFAULT true,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create sessions table for token management
  await query(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('User tables initialized successfully');
}

// Hash password using Node.js crypto
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Verify password
function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// Generate JWT-like token (simplified)
function generateToken(userId) {
  const payload = {
    userId,
    timestamp: Date.now(),
    random: crypto.randomBytes(16).toString('hex')
  };
  
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Hash token for storage
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Register new user
async function registerUser(userData) {
  const { email, password, fullName, company } = userData;

  // Validate required fields
  if (!email || !password || !fullName) {
    return createResponse(400, { error: 'Email, password, and full name are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return createResponse(400, { error: 'Invalid email format' });
  }

  // Validate password strength
  if (password.length < 6) {
    return createResponse(400, { error: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return createResponse(409, { error: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Create user
    const result = await query(`
      INSERT INTO users (email, password_hash, full_name, company)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, full_name, company, role, created_at
    `, [email.toLowerCase(), passwordHash, fullName, company || null]);

    const user = result.rows[0];

    // Generate token
    const token = generateToken(user.id);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store session
    await query(`
      INSERT INTO user_sessions (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
    `, [user.id, tokenHash, expiresAt]);

    return createResponse(201, {
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        company: user.company,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    return createResponse(500, { error: 'Registration failed' });
  }
}

// Login user
async function loginUser(credentials) {
  const { email, password } = credentials;

  if (!email || !password) {
    return createResponse(400, { error: 'Email and password are required' });
  }

  try {
    // Get user by email
    const userResult = await query(`
      SELECT id, email, password_hash, full_name, company, role, is_active
      FROM users 
      WHERE email = $1
    `, [email.toLowerCase()]);

    if (userResult.rows.length === 0) {
      return createResponse(401, { error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return createResponse(401, { error: 'Account is deactivated' });
    }

    // Verify password
    if (!verifyPassword(password, user.password_hash)) {
      return createResponse(401, { error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Clean old sessions and store new session
    await query('DELETE FROM user_sessions WHERE user_id = $1 AND expires_at < NOW()', [user.id]);
    await query(`
      INSERT INTO user_sessions (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
    `, [user.id, tokenHash, expiresAt]);

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    return createResponse(200, {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        company: user.company,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return createResponse(500, { error: 'Login failed' });
  }
}

// Verify token
async function verifyToken(tokenData) {
  const { token } = tokenData;

  if (!token) {
    return createResponse(400, { error: 'Token is required' });
  }

  try {
    const tokenHash = hashToken(token);

    // Check if token exists and is valid
    const sessionResult = await query(`
      SELECT s.user_id, s.expires_at, u.email, u.full_name, u.company, u.role, u.is_active
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token_hash = $1 AND s.expires_at > NOW()
    `, [tokenHash]);

    if (sessionResult.rows.length === 0) {
      return createResponse(401, { error: 'Invalid or expired token' });
    }

    const session = sessionResult.rows[0];

    if (!session.is_active) {
      return createResponse(401, { error: 'Account is deactivated' });
    }

    return createResponse(200, {
      valid: true,
      user: {
        id: session.user_id,
        email: session.email,
        fullName: session.full_name,
        company: session.company,
        role: session.role
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return createResponse(500, { error: 'Token verification failed' });
  }
}

// Get user profile
async function getUserProfile(headers) {
  const authHeader = headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return createResponse(401, { error: 'Authorization token required' });
  }

  const token = authHeader.substring(7);
  const verifyResult = await verifyToken({ token });
  
  if (verifyResult.statusCode !== 200) {
    return verifyResult;
  }

  return createResponse(200, JSON.parse(verifyResult.body));
}