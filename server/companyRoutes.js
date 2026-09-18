const express = require('express');
const router = express.Router();
const pool = require('./db');
const { verifyToken, requireRole } = require('./authMiddleware');

// GET /api/companies — list all companies (for dropdown)
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM companies ORDER BY name ASC');
    res.json({ success: true, companies: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// POST /api/companies — create a new company
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, industry, website, hr_email, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: true, message: 'Company name is required' });
    }
    const result = await pool.query(
      `INSERT INTO companies (name, industry, website, hr_email, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name`,
      [name, industry, website, hr_email, address]
    );
    res.status(201).json({ success: true, company: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

module.exports = router;