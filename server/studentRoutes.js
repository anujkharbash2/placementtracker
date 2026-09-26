const express = require('express');
const router = express.Router();
const pool = require('./db');
const { verifyToken, requireRole } = require('./authMiddleware');

// GET /api/students/profile — get the logged-in student's own profile
router.get('/profile', verifyToken, requireRole('student'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        u.mobile_number,
        s.roll_number,
        s.degree,
        s.branch,
        s.cgpa,
        s.active_backlogs,
        s.admission_year,
        s.passing_year,
        s.gender,
        s.category,
        s.placement_status
      FROM students s
      JOIN users u ON u.id = s.user_id
      WHERE s.user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Student profile not found' });
    }

    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// PATCH /api/students/profile — update the logged-in student's own profile
router.patch('/profile', verifyToken, requireRole('student'), async (req, res) => {
  const client = await pool.connect();
  try {
    const { degree, branch, cgpa, active_backlogs, admission_year, passing_year, gender, category, mobile_number } = req.body;

    if (cgpa !== undefined && (cgpa < 0 || cgpa > 10)) {
      return res.status(400).json({ error: true, message: 'CGPA must be between 0 and 10' });
    }
    if (active_backlogs !== undefined && active_backlogs < 0) {
      return res.status(400).json({ error: true, message: 'Active backlogs cannot be negative' });
    }
    if (mobile_number !== undefined && !/^[0-9]{10}$/.test(mobile_number)) {
      return res.status(400).json({ error: true, message: 'Mobile number must be 10 digits' });
    }

    await client.query('BEGIN');

    // Update students table (academic fields)
    const fields = [];
    const values = [];
    let index = 1;

    if (degree !== undefined) { fields.push(`degree = $${index++}`); values.push(degree); }
    if (branch !== undefined) { fields.push(`branch = $${index++}`); values.push(branch); }
    if (cgpa !== undefined) { fields.push(`cgpa = $${index++}`); values.push(cgpa); }
    if (active_backlogs !== undefined) { fields.push(`active_backlogs = $${index++}`); values.push(active_backlogs); }
    if (admission_year !== undefined) { fields.push(`admission_year = $${index++}`); values.push(admission_year); }
    if (passing_year !== undefined) { fields.push(`passing_year = $${index++}`); values.push(passing_year); }
    if (gender !== undefined) { fields.push(`gender = $${index++}`); values.push(gender); }
    if (category !== undefined) { fields.push(`category = $${index++}`); values.push(category); }

    if (fields.length > 0) {
      values.push(req.user.userId);
      const studentQuery = `UPDATE students SET ${fields.join(', ')} WHERE user_id = $${index} RETURNING *`;
      await client.query(studentQuery, values);
    }

    // Update users table (mobile_number only — name/email are never editable here)
    if (mobile_number !== undefined) {
      await client.query(
        `UPDATE users SET mobile_number = $1 WHERE id = $2`,
        [mobile_number, req.user.userId]
      );
    }

    if (fields.length === 0 && mobile_number === undefined) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: true, message: 'No fields provided to update' });
    }

    await client.query('COMMIT');

    // Fetch and return the full updated profile
    const result = await client.query(
      `SELECT u.id AS user_id, u.name, u.email, u.mobile_number,
              s.roll_number, s.degree, s.branch, s.cgpa, s.active_backlogs,
              s.admission_year, s.passing_year, s.gender, s.category, s.placement_status
       FROM students s
       JOIN users u ON u.id = s.user_id
       WHERE s.user_id = $1`,
      [req.user.userId]
    );

    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: true, message: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;

