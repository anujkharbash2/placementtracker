const express = require('express');
const router = express.Router();
const pool = require('./db');
const { hashPassword, comparePassword, generateRandomPassword } = require('./passwordUtils');
const jwt = require('jsonwebtoken');
const { verifyToken, requireRole } = require('./authMiddleware');
const { sendCredentialsEmail } = require('./emailutils');

// POST /api/auth/bootstrap-admin
router.post('/bootstrap-admin', async (req, res) => {
  if (process.env.BOOTSTRAP_ENABLED !== 'true') {
    return res.status(404).json({ error: true, message: 'Not found' });
  }

  try {
    const adminCheck = await pool.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );
    if (adminCheck.rows.length > 0) {
      return res.status(403).json({ error: true, message: 'Admin already exists' });
    }

    const { name, email, password, mobile_number } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: true, message: 'Missing required fields' });
    }

    const password_hash = await hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, mobile_number, role)
       VALUES ($1, $2, $3, $4, 'admin')
       RETURNING id, name, email, role`,
      [name, email, password_hash, mobile_number]
    );

    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// POST /api/auth/register
router.post('/register', verifyToken, requireRole('admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, email, mobile_number, role } = req.body; // no password from admin anymore

    if (!name || !email || !role) {
      return res.status(400).json({ error: true, message: 'Missing required fields' });
    }
    if (!['student', 'recruiter', 'admin'].includes(role)) {
      return res.status(400).json({ error: true, message: 'Invalid role' });
    }

    const plainPassword = generateRandomPassword();
    const password_hash = await hashPassword(plainPassword);

    await client.query('BEGIN');

    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, mobile_number, role, must_reset_password)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, name, email, role`,
      [name, email, password_hash, mobile_number, role]
    );
    const newUser = userResult.rows[0];

    if (role === 'student') {
      const { roll_number } = req.body;
      if (!roll_number) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: true, message: 'Missing student fields' });
      }
      await client.query(
        `INSERT INTO students (user_id, roll_number)
         VALUES ($1, $2)`,
        [newUser.id, roll_number, ]
      );
    } else if (role === 'recruiter') {
      const { company_id, designation, official_email } = req.body;
      if (!company_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: true, message: 'Missing company_id for recruiter' });
      }
      await client.query(
        `INSERT INTO recruiters (user_id, company_id, name, designation, official_email)
         VALUES ($1, $2, $3, $4, $5)`,
        [newUser.id, company_id, name, designation, official_email]
      );
    }

    await client.query('COMMIT');

    await sendCredentialsEmail(email, name, plainPassword);

    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: true, message: 'Email or roll number already exists' });
    }
    res.status(500).json({ error: true, message: 'Server error' });
  } finally {
    client.release();
  }
});



// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: true, message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const match = await comparePassword(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: true, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { id: user.id, role: user.role, name: user.name },
      must_reset_password: user.must_reset_password
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});


// reset-password route
router.post('/reset-password', verifyToken, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: true, message: 'Password must be at least 6 characters' });
    }

    const password_hash = await hashPassword(newPassword);

    await pool.query(
      `UPDATE users SET password_hash = $1, must_reset_password = false WHERE id = $2`,
      [password_hash, req.user.userId]
    );

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

module.exports = router;