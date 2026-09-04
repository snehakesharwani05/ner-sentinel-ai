const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticateToken, JWT_SECRET } = require('../middleware/authMiddleware');

// In-Memory Brute-Force Rate Limiter
const loginAttempts = new Map(); // email -> { count: number, lockedUntil: number }

function checkRateLimit(email) {
  const record = loginAttempts.get(email);
  if (!record) return { allowed: true };

  const now = Date.now();
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      error: `Security Lockout: Too many failed login attempts. Account temporarily locked for ${remainingSeconds}s.`
    };
  }

  if (record.lockedUntil && now >= record.lockedUntil) {
    loginAttempts.delete(email);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedAttempt(email) {
  const now = Date.now();
  const record = loginAttempts.get(email) || { count: 0, lockedUntil: null };
  record.count += 1;

  if (record.count >= 5) {
    record.lockedUntil = now + (3 * 60 * 1000); // 3-minute lockout
  }
  loginAttempts.set(email, record);
}

function clearFailedAttempts(email) {
  loginAttempts.delete(email);
}

// Password Complexity Validator
function validatePasswordStrength(password) {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character (!@#$%^&*).' };
  }
  return { valid: true };
}

// POST /api/v1/auth/register & /api/auth/register
router.post('/register', (req, res, next) => {
  try {
    const { name, email, password, role, serviceBadgeId, country_code, countryCode, mobile_number, mobileNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Full name & rank, email, and password are required.' });
    }

    const passCheck = validatePasswordStrength(password);
    if (!passCheck.valid) {
      return res.status(400).json({ success: false, error: passCheck.error });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const code = (country_code || countryCode || '+91').trim();
    const rawMobile = (mobile_number || mobileNumber || '').toString().trim();
    const cleanMobileDigits = rawMobile.replace(/\D/g, '');

    const requestedRole = (role || 'citizen').toLowerCase().trim();

    // 1. Dynamic First-Come, First-Served Administrator Provisioning (Max 10)
    if (requestedRole === 'admin') {
      const adminCount = db.prepare(`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`).get()?.count || 0;
      if (adminCount >= 10) {
        return res.status(400).json({
          success: false,
          error: 'Maximum capacity of 10 administrators has been reached.'
        });
      }
    }

    const existing = db.prepare(`SELECT id FROM users WHERE LOWER(email) = ?`).get(normalizedEmail);
    if (existing) {
      return res.status(409).json({ success: false, error: 'This email is already registered in the Sentinel AI registry. Please sign in.' });
    }

    // High security salt: 12 rounds for Password AND Mobile Number
    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync(password, salt);

    let mobileHash = null;
    let mobileMasked = null;
    if (cleanMobileDigits) {
      const fullMobile = `${code}${cleanMobileDigits}`;
      const mobileSalt = bcrypt.genSaltSync(12);
      mobileHash = bcrypt.hashSync(fullMobile, mobileSalt);
      const maskedPart = cleanMobileDigits.length > 4 ? '*'.repeat(cleanMobileDigits.length - 4) + cleanMobileDigits.slice(-4) : cleanMobileDigits;
      mobileMasked = `${code} ${maskedPart}`;
    }

    const userRole = ['admin', 'operator', 'disaster_mgmt', 'driver', 'citizen', 'public_citizen'].includes(requestedRole) ? requestedRole : 'citizen';

    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, country_code, mobile_hash, mobile_masked, service_badge_id, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(cleanName, normalizedEmail, passwordHash, code, mobileHash, mobileMasked, serviceBadgeId || null, userRole);

    const newUser = db.prepare(`SELECT id, name, email, role, country_code, mobile_masked, service_badge_id, created_at FROM users WHERE LOWER(email) = ?`).get(normalizedEmail);
    
    // Sign High-Security JWT with Full Privileges for Administrators
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        serviceBadgeId: serviceBadgeId || (userRole === 'admin' ? 'NER-CORE-ADMIN' : 'NER-PUBLIC-USER'),
        adminAccess: userRole === 'admin',
        iss: 'NER-Sentinel-Security-Gateway'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const securityClassification = userRole === 'admin'
      ? 'FULL_SYSTEM_COMMAND_CLEARANCE'
      : (userRole === 'citizen' || userRole === 'public_citizen' ? 'PUBLIC_ACCESS' : 'RESTRICTED_COMMAND');

    res.status(201).json({
      success: true,
      message: userRole === 'admin'
        ? 'Administrator Command Profile Created with Full System Privileges.'
        : 'High-Security Officer/Citizen Profile Created Successfully.',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          country_code: newUser.country_code,
          mobile_masked: newUser.mobile_masked,
          serviceBadgeId: serviceBadgeId || (userRole === 'admin' ? 'NER-CORE-ADMIN' : null),
          securityClassification,
          adminAccess: userRole === 'admin',
          created_at: newUser.created_at
        },
        token
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/login
router.post('/login', (req, res, next) => {
  try {
    const { email, password, twoFactorOtp } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Rate Limit & Brute-force check
    const rateCheck = checkRateLimit(normalizedEmail);
    if (!rateCheck.allowed) {
      return res.status(429).json({ success: false, error: rateCheck.error });
    }

    // 2. Lookup user in database
    const user = db.prepare(`SELECT * FROM users WHERE LOWER(email) = ?`).get(normalizedEmail);
    if (!user) {
      recordFailedAttempt(normalizedEmail);
      return res.status(401).json({ success: false, error: 'Authentication Failed: No registered personnel found for this email address.' });
    }

    // 3. Compare Bcrypt password hash
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      recordFailedAttempt(normalizedEmail);
      const remainingAttempts = 5 - (loginAttempts.get(normalizedEmail)?.count || 0);
      return res.status(401).json({
        success: false,
        error: `Authentication Failed: Incorrect security credentials. ${Math.max(0, remainingAttempts)} attempts remaining before account lockout.`
      });
    }

    // Successful login -> clear failed counter
    clearFailedAttempts(normalizedEmail);

    // 4. Dynamic Admin Verification on Login
    if (user.role === 'admin') {
      const dbAdmin = db.prepare(`SELECT id FROM users WHERE role = 'admin' AND LOWER(email) = ?`).get(normalizedEmail);
      if (!dbAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Access Denied: This account is not an authorized Administrator.'
        });
      }
    }

    // Sign High-Security JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        serviceBadgeId: user.service_badge_id || (user.role === 'admin' ? 'NER-CORE-ADMIN' : null),
        iss: 'NER-Sentinel-Security-Gateway'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const securityClassification = user.role === 'admin'
      ? 'FULL_SYSTEM_COMMAND_CLEARANCE'
      : (user.role === 'citizen' || user.role === 'public_citizen' ? 'PUBLIC_ACCESS' : 'RESTRICTED_COMMAND');

    res.json({
      success: true,
      message: 'Command Clearance Authorized',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          country_code: user.country_code,
          mobile_masked: user.mobile_masked,
          serviceBadgeId: user.service_badge_id || (user.role === 'admin' ? 'NER-CORE-ADMIN' : null),
          securityClassification,
          adminAccess: user.role === 'admin',
          privileges: user.role === 'admin' ? {
            dashboardModules: true,
            routingEngines: true,
            simulations: true,
            telemetryControls: true,
            fleetDispatch: true
          } : {},
          created_at: user.created_at
        },
        token
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/auth/me
router.get('/me', authenticateToken, (req, res, next) => {
  try {
    const user = db.prepare(`SELECT id, name, email, role, country_code, mobile_masked, service_badge_id, created_at FROM users WHERE id = ?`).get(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Officer profile not found.' });
    }
    const securityClassification = user.role === 'admin'
      ? 'FULL_SYSTEM_COMMAND_CLEARANCE'
      : (user.role === 'citizen' || user.role === 'public_citizen' ? 'PUBLIC_ACCESS' : 'RESTRICTED_COMMAND');

    res.json({
      success: true,
      data: {
        ...user,
        securityClassification,
        adminAccess: user.role === 'admin',
        privileges: user.role === 'admin' ? {
          dashboardModules: true,
          routingEngines: true,
          simulations: true,
          telemetryControls: true,
          fleetDispatch: true
        } : {}
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
