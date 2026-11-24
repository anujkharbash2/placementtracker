const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const pool = require('./db');
const { verifyToken, requireRole } = require('./authMiddleware');

const UPLOAD_DIR = path.join(__dirname, 'uploads', 'resumes');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_SIZE = 2 * 1024 * 1024;
const MAX_RESUMES = 10;

// Random stored name: the student's original filename never touches the file path.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + '.pdf'),
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' &&
                  path.extname(file.originalname).toLowerCase() === '.pdf';
    isPdf ? cb(null, true) : cb(new Error('Only PDF files are allowed'));
  },
}).single('resume');

function handleUpload(req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'File must be 2 MB or smaller' : err.message;
      return res.status(400).json({ error: true, message });
    }
    next();
  });
}

function looksLikePdf(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const buf = Buffer.alloc(4);
  fs.readSync(fd, buf, 0, 4, 0);
  fs.closeSync(fd);
  return buf.toString() === '%PDF';
}

// POST /api/resumes — upload (form-data, field name "resume")
router.post('/', verifyToken, requireRole('student'), handleUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: true, message: 'No file uploaded (field name: resume)' });
    }

    // Check the real file content, not just the extension/mimetype the client claims.
    if (!looksLikePdf(req.file.path)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: true, message: 'File is not a valid PDF' });
    }

    const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.userId]);
    if (studentResult.rows.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: true, message: 'Student profile not found' });
    }
    const studentId = studentResult.rows[0].id;

    const count = await pool.query('SELECT COUNT(*) FROM resumes WHERE student_id = $1', [studentId]);
    if (parseInt(count.rows[0].count) >= MAX_RESUMES) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: true, message: `You can keep at most ${MAX_RESUMES} resumes. Delete an old one first.` });
    }

    const result = await pool.query(
      `INSERT INTO resumes (student_id, original_name, stored_name, file_size)
       VALUES ($1, $2, $3, $4)
       RETURNING id, original_name, file_size, uploaded_at`,
      [studentId, req.file.originalname.slice(0, 255), req.file.filename, req.file.size]
    );

    res.status(201).json({ success: true, message: 'Resume uploaded', data: result.rows[0] });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Upload resume error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// GET /api/resumes — the student's own resumes
router.get('/', verifyToken, requireRole('student'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.original_name, r.file_size, r.uploaded_at,
              EXISTS (SELECT 1 FROM applications a WHERE a.resume_id = r.id) AS in_use
       FROM resumes r
       JOIN students s ON s.id = r.student_id
       WHERE s.user_id = $1
       ORDER BY r.uploaded_at DESC`,
      [req.user.userId]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('List resumes error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// GET /api/resumes/:id/file — owner, admin, or a recruiter of the company the student applied to
router.get('/:id/file', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: true, message: 'Invalid resume ID' });

    const resumeResult = await pool.query(
      `SELECT r.stored_name, r.original_name, s.user_id AS owner_user_id
       FROM resumes r JOIN students s ON s.id = r.student_id
       WHERE r.id = $1`, [id]
    );
    if (resumeResult.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Resume not found' });
    }
    const resume = resumeResult.rows[0];

    let allowed = false;
    if (req.user.role === 'admin') {
      allowed = true;
    } else if (req.user.role === 'student') {
      allowed = resume.owner_user_id === req.user.userId;
    } else if (req.user.role === 'recruiter') {
      const check = await pool.query(
        `SELECT 1
         FROM applications a
         JOIN drives d ON d.id = a.drive_id
         JOIN recruiters dr ON dr.id = d.recruiter_id
         JOIN recruiters me ON me.company_id = dr.company_id
         WHERE a.resume_id = $1 AND me.user_id = $2
         LIMIT 1`,
        [id, req.user.userId]
      );
      allowed = check.rows.length > 0;
    }
    if (!allowed) return res.status(403).json({ error: true, message: 'Access denied' });

    const filePath = path.join(UPLOAD_DIR, resume.stored_name);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: true, message: 'File missing on server' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="resume.pdf"`);
    res.sendFile(filePath);
  } catch (err) {
    console.error('Download resume error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// DELETE /api/resumes/:id — only if no application uses it
router.delete('/:id', verifyToken, requireRole('student'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: true, message: 'Invalid resume ID' });

    const found = await pool.query(
      `SELECT r.id, r.stored_name
       FROM resumes r JOIN students s ON s.id = r.student_id
       WHERE r.id = $1 AND s.user_id = $2`,
      [id, req.user.userId]
    );
    if (found.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Resume not found' });
    }

    try {
      await pool.query('DELETE FROM resumes WHERE id = $1', [id]);
    } catch (err) {
      if (err.code === '23503') {
        return res.status(409).json({ error: true, message: 'This resume is used in an application and cannot be deleted' });
      }
      throw err;
    }

    const filePath = path.join(UPLOAD_DIR, found.rows[0].stored_name);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ success: true, message: 'Resume deleted' });
  } catch (err) {
    console.error('Delete resume error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

module.exports = router;