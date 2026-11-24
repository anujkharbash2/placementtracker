const express = require('express');
const router = express.Router();
const pool = require('./db');
const { verifyToken, requireRole } = require('./authMiddleware');
const { checkEligibility } = require('./eligibility');
// ---------- helpers ----------

// Builds WHERE conditions from query params, shared by admin list and recruiter list.
// `conditions` and `params` are mutated; placeholders continue from params.length.
function applyDriveFilters(q, conditions, params, { allowCompany = false } = {}) {
  const { status, timeline, type, search, company_id } = q;

  if (status) {
    if (!['pending', 'approved', 'rejected'].includes(status)) return 'Invalid status filter';
    params.push(status);
    conditions.push(`d.approval_status = $${params.length}`);
  }
  if (timeline) {
    if (timeline === 'current') {
      conditions.push(`(d.application_deadline IS NULL OR d.application_deadline >= NOW())`);
    } else if (timeline === 'past') {
      conditions.push(`d.application_deadline < NOW()`);
    } else {
      return 'Invalid timeline filter';
    }
  }
  if (type) {
    if (!['job', 'internship'].includes(type)) return 'Invalid type filter';
    params.push(type);
    conditions.push(`d.type = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`d.title ILIKE $${params.length}`);
  }
  if (allowCompany && company_id) {
    const cid = parseInt(company_id);
    if (isNaN(cid)) return 'Invalid company_id';
    params.push(cid);
    conditions.push(`c.id = $${params.length}`);
  }
  return null;
}

function getPagination(q) {
  const page = Math.max(parseInt(q.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(q.limit) || 10, 1), 100);
  return { page, limit, offset: (page - 1) * limit };
}

// ---------- POST /api/drives (recruiter creates) ----------
router.post('/', verifyToken, requireRole('recruiter'), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      title, type, description, min_cgpa, max_backlogs,
      allowed_branches, allowed_degrees, eligible_passing_years,
      package_or_stipend, job_location, number_of_openings, application_deadline,
      rounds
    } = req.body;

    if (!title || !type || !number_of_openings || !application_deadline) {
      return res.status(400).json({ error: true, message: 'Required fields are missing' });
    }
    if (!['job', 'internship'].includes(type)) {
      return res.status(400).json({ error: true, message: 'Invalid drive type' });
    }
    if (min_cgpa !== undefined && min_cgpa !== null && (min_cgpa < 0 || min_cgpa > 10)) {
      return res.status(400).json({ error: true, message: 'CGPA must be between 0 and 10' });
    }
    if (max_backlogs !== undefined && max_backlogs !== null && max_backlogs < 0) {
      return res.status(400).json({ error: true, message: 'Maximum backlogs cannot be negative' });
    }
    if (number_of_openings <= 0) {
      return res.status(400).json({ error: true, message: 'Number of openings must be greater than 0' });
    }
    if (isNaN(Date.parse(application_deadline))) {
      return res.status(400).json({ error: true, message: 'Invalid application deadline' });
    }
    for (const [name, val] of [
      ['allowed_branches', allowed_branches],
      ['allowed_degrees', allowed_degrees],
      ['eligible_passing_years', eligible_passing_years],
    ]) {
      if (val !== undefined && val !== null && !Array.isArray(val)) {
        return res.status(400).json({ error: true, message: `${name} must be an array` });
      }
    }
    if (rounds !== undefined) {
      if (!Array.isArray(rounds) || rounds.length < 1 || rounds.length > 10) {
        return res.status(400).json({ error: true, message: 'Provide 1 to 10 round names' });
      }
      if (rounds.some((r) => typeof r !== 'string' || !r.trim())) {
        return res.status(400).json({ error: true, message: 'Round names cannot be empty' });
      }
    }

    const recruiterResult = await client.query(
      `SELECT id FROM recruiters WHERE user_id = $1`,
      [req.user.userId]
    );
    if (recruiterResult.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Recruiter profile not found' });
    }
    const recruiterId = recruiterResult.rows[0].id;

    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO drives (
        recruiter_id, title, type, description, min_cgpa, max_backlogs,
        allowed_branches, allowed_degrees, eligible_passing_years,
        package_or_stipend, job_location, number_of_openings, application_deadline
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        recruiterId, title, type, description || null, min_cgpa ?? null, max_backlogs ?? null,
        allowed_branches || null, allowed_degrees || null, eligible_passing_years || null,
        package_or_stipend || null, job_location || null, number_of_openings, application_deadline
      ]
    );

    const driveId = result.rows[0].id;
    const roundNames = (rounds && rounds.length > 0) ? rounds : ['Interview'];
    const insertedRounds = [];
    for (let i = 0; i < roundNames.length; i++) {
      const r = await client.query(
        `INSERT INTO drive_rounds (drive_id, round_order, name) VALUES ($1, $2, $3) RETURNING id, round_order, name`,
        [driveId, i + 1, roundNames[i].trim()]
      );
      insertedRounds.push(r.rows[0]);
    }

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Drive created successfully',
      data: { ...result.rows[0], rounds: insertedRounds }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create drive error:', err);
    return res.status(500).json({ error: true, message: 'Failed to create drive' });
  } finally {
    client.release();
  }
});
// ---------- GET /api/drives/mine (recruiter, all own drives, filterable) ----------
router.get('/mine', verifyToken, requireRole('recruiter'), async (req, res) => {
  try {
    const recruiterResult = await pool.query(
      `SELECT id FROM recruiters WHERE user_id = $1`,
      [req.user.userId]
    );
    if (recruiterResult.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Recruiter profile not found' });
    }

    const params = [recruiterResult.rows[0].id];
    const conditions = ['d.recruiter_id = $1'];

    const filterError = applyDriveFilters(req.query, conditions, params);
    if (filterError) return res.status(400).json({ error: true, message: filterError });

    const where = `WHERE ${conditions.join(' AND ')}`;
    const { page, limit, offset } = getPagination(req.query);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM drives d ${where}`,
      params
    );

    const listParams = [...params, limit, offset];
    const result = await pool.query(
      `SELECT d.*, u.name AS approved_by_name
       FROM drives d
       LEFT JOIN users u ON d.approved_by = u.id
       ${where}
       ORDER BY d.created_at DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    const total = parseInt(countResult.rows[0].count);
    return res.status(200).json({
      success: true,
      message: 'Your drives fetched successfully',
      total, page, limit, totalPages: Math.ceil(total / limit),
      data: result.rows
    });
  } catch (err) {
    console.error('Get recruiter drives error:', err);
    return res.status(500).json({ error: true, message: 'Failed to fetch your drives' });
  }
});

// ---------- GET /api/drives/available (student) ----------
// Returns approved, non-expired drives. Eligibility is FLAGGED, not filtered.
router.get('/available', verifyToken, requireRole('student'), async (req, res) => {
  try {
    const studentResult = await pool.query(
      `SELECT id, cgpa, branch, active_backlogs, passing_year, degree
       FROM students WHERE user_id = $1`,
      [req.user.userId]
    );
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Student profile not found' });
    }
    const s = studentResult.rows[0];

    const profileIncomplete =
      s.cgpa === null || !s.branch || !s.degree || s.passing_year === null;

    const result = await pool.query(
      `SELECT
        d.*,
        r.name AS recruiter_name, r.designation AS recruiter_designation,
        c.id AS company_id, c.name AS company_name,
        c.industry AS company_industry, c.website AS company_website
      FROM drives d
      INNER JOIN recruiters r ON d.recruiter_id = r.id
      INNER JOIN companies c ON r.company_id = c.id
      WHERE d.approval_status = 'approved'
        AND (d.application_deadline IS NULL OR d.application_deadline >= NOW())
      ORDER BY d.application_deadline ASC NULLS LAST`
    );

    // Drives this student has already applied to
    const appliedResult = await pool.query(
      `SELECT drive_id FROM applications WHERE student_id = $1`,
      [s.id]
    );
    const appliedSet = new Set(appliedResult.rows.map((r) => r.drive_id));

    const data = result.rows.map((d) => {
      const reasons = checkEligibility(s, d);
      return {
        ...d,
        is_eligible: reasons.length === 0,
        ineligible_reasons: reasons,
        already_applied: appliedSet.has(d.id)
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Available drives fetched successfully',
      profile_incomplete: profileIncomplete,
      count: data.length,
      data
    });
  } catch (err) {
    console.error('Get available drives error:', err);
    return res.status(500).json({ error: true, message: 'Failed to fetch available drives' });
  }
});


// ---------- GET /api/drives/pending (admin) ----------
router.get('/pending', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        d.*,
        r.name AS recruiter_name, r.designation AS recruiter_designation,
        r.official_email AS recruiter_email, r.mobile_number AS recruiter_mobile,
        c.id AS company_id, c.name AS company_name, c.industry AS company_industry,
        c.website AS company_website, c.hr_email AS company_hr_email, c.address AS company_address
      FROM drives d
      INNER JOIN recruiters r ON d.recruiter_id = r.id
      INNER JOIN companies c ON r.company_id = c.id
      WHERE d.approval_status = 'pending'
      ORDER BY d.created_at DESC`
    );
    return res.status(200).json({
      success: true, message: 'Pending drives fetched successfully',
      count: result.rows.length, data: result.rows
    });
  } catch (err) {
    console.error('Get pending drives error:', err);
    return res.status(500).json({ error: true, message: 'Failed to fetch pending drives' });
  }
});

// ---------- GET /api/drives (admin, ALL drives, filterable) ----------
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const params = [];
    const conditions = [];

    const filterError = applyDriveFilters(req.query, conditions, params, { allowCompany: true });
    if (filterError) return res.status(400).json({ error: true, message: filterError });

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { page, limit, offset } = getPagination(req.query);

        const countResult = await pool.query(
      `SELECT COUNT(*)
       FROM drives d
       INNER JOIN recruiters r ON d.recruiter_id = r.id
       INNER JOIN companies c ON r.company_id = c.id
       ${where}`,
      params
    );

    const listParams = [...params, limit, offset];
    const result = await pool.query(
      `SELECT
        d.*,
        r.name AS recruiter_name, r.designation AS recruiter_designation,
        c.id AS company_id, c.name AS company_name,
        u.name AS approved_by_name, u.email AS approved_by_email,
        (d.application_deadline IS NOT NULL AND d.application_deadline < NOW()) AS deadline_passed
      FROM drives d
      INNER JOIN recruiters r ON d.recruiter_id = r.id
      INNER JOIN companies c ON r.company_id = c.id
      LEFT JOIN users u ON d.approved_by = u.id
      ${where}
      ORDER BY d.created_at DESC
      LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    const total = parseInt(countResult.rows[0].count);
    return res.status(200).json({
      success: true,
      message: 'Drives fetched successfully',
      total, page, limit, totalPages: Math.ceil(total / limit),
      data: result.rows
    });
  } catch (err) {
    console.error('Get all drives error:', err);
    return res.status(500).json({ error: true, message: 'Failed to fetch drives' });
  }
});
// GET /api/drives/:id/rounds — anyone who can see the drive can see its stages
router.get('/:id/rounds', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: true, message: 'Invalid drive ID' });

    const result = await pool.query(
      `SELECT id, round_order, name FROM drive_rounds WHERE drive_id = $1 ORDER BY round_order`,
      [id]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('Get rounds error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// ---------- PATCH /api/drives/:id/approve (admin) ----------
router.patch('/:id/approve', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: true, message: 'Invalid drive ID' });

    const result = await pool.query(
      `UPDATE drives
       SET approval_status = 'approved', approved_by = $1, reviewed_at = NOW(), rejection_reason = NULL
       WHERE id = $2 AND approval_status = 'pending'
       RETURNING *`,
      [req.user.userId, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Pending drive not found' });
    }
    return res.status(200).json({ success: true, message: 'Drive approved successfully', data: result.rows[0] });
  } catch (err) {
    console.error('Approve drive error:', err);
    return res.status(500).json({ error: true, message: 'Failed to approve drive' });
  }
});

// ---------- PATCH /api/drives/:id/reject (admin, reason required) ----------
router.patch('/:id/reject', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: true, message: 'Invalid drive ID' });

    const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
    if (!reason) {
      return res.status(400).json({ error: true, message: 'Rejection reason is required' });
    }

    const result = await pool.query(
      `UPDATE drives
       SET approval_status = 'rejected', approved_by = $1, reviewed_at = NOW(), rejection_reason = $2
       WHERE id = $3 AND approval_status = 'pending'
       RETURNING *`,
      [req.user.userId, reason, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Pending drive not found' });
    }
    return res.status(200).json({ success: true, message: 'Drive rejected successfully', data: result.rows[0] });
  } catch (err) {
    console.error('Reject drive error:', err);
    return res.status(500).json({ error: true, message: 'Failed to reject drive' });
  }
});

module.exports = router;