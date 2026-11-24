const express = require('express');
const router = express.Router();
const pool = require('./db');
const { verifyToken, requireRole } = require('./authMiddleware');
const { checkEligibility } = require('./eligibility');
const { sendRoundUpdateEmail, sendOfferEmail } = require('./emailutils');

// POST /api/applications — student applies { drive_id, resume_id }
router.post('/', verifyToken, requireRole('student'), async (req, res) => {
  const client = await pool.connect();
  try {
    const driveId = parseInt(req.body.drive_id);
    const resumeId = parseInt(req.body.resume_id);
    if (isNaN(driveId) || isNaN(resumeId)) {
      return res.status(400).json({ error: true, message: 'drive_id and resume_id are required' });
    }

    const studentResult = await client.query(
      `SELECT id, cgpa, branch, active_backlogs, passing_year, degree, placement_status
       FROM students WHERE user_id = $1`, [req.user.userId]
    );
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Student profile not found' });
    }
    const student = studentResult.rows[0];

    if (student.placement_status === 'placed') {
      return res.status(403).json({ error: true, message: 'You already have an accepted offer and cannot apply to further drives' });
    }

    const driveResult = await client.query(
      `SELECT *, (application_deadline IS NOT NULL AND application_deadline < NOW()) AS deadline_passed
       FROM drives WHERE id = $1 AND approval_status = 'approved'`, [driveId]
    );
    if (driveResult.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Drive not found' });
    }
    const drive = driveResult.rows[0];
    if (drive.deadline_passed) {
      return res.status(400).json({ error: true, message: 'The application deadline has passed' });
    }

    const reasons = checkEligibility(student, drive);
    if (reasons.length > 0) {
      return res.status(403).json({
        error: true,
        message: `Not eligible: ${reasons.join('; ')}`,
        reasons
      });
    }

    const resumeResult = await client.query(
      'SELECT id FROM resumes WHERE id = $1 AND student_id = $2', [resumeId, student.id]
    );
    if (resumeResult.rows.length === 0) {
      return res.status(400).json({ error: true, message: 'Invalid resume selected' });
    }

    const firstRound = await client.query(
      `SELECT id, name FROM drive_rounds WHERE drive_id = $1 ORDER BY round_order LIMIT 1`,
      [driveId]
    );
    if (firstRound.rows.length === 0) {
      return res.status(500).json({ error: true, message: 'This drive has no rounds configured' });
    }

    await client.query('BEGIN');
    const appResult = await client.query(
      `INSERT INTO applications (student_id, drive_id, resume_id, current_round_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [student.id, driveId, resumeId, firstRound.rows[0].id]
    );
    await client.query(
      `INSERT INTO status_history (application_id, status, changed_by) VALUES ($1, $2, $3)`,
      [appResult.rows[0].id, `Applied — ${firstRound.rows[0].name}`, req.user.userId]
    );
    await client.query('COMMIT');

    res.status(201).json({ success: true, message: 'Application submitted', data: appResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ error: true, message: 'You have already applied to this drive' });
    }
    console.error('Apply error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  } finally {
    client.release();
  }
});

// Shared SELECT fragment for round/outcome info
const ROUND_FIELDS = `
  cr.round_order AS current_round_order,
  cr.name AS current_round_name,
  (SELECT COUNT(*) FROM drive_rounds dr2 WHERE dr2.drive_id = a.drive_id) AS total_rounds,
  a.outcome
`;

// GET /api/applications/mine
router.get('/mine', verifyToken, requireRole('student'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.applied_at, a.updated_at, a.resume_id,
              d.id AS drive_id, d.title, d.type, d.job_location, d.package_or_stipend,
              d.application_deadline, c.name AS company_name,
              ${ROUND_FIELDS}
       FROM applications a
       JOIN students s ON s.id = a.student_id
       JOIN drives d ON d.id = a.drive_id
       JOIN recruiters r ON r.id = d.recruiter_id
       JOIN companies c ON c.id = r.company_id
       LEFT JOIN drive_rounds cr ON cr.id = a.current_round_id
       WHERE s.user_id = $1
       ORDER BY a.applied_at DESC`,
      [req.user.userId]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('My applications error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// GET /api/applications/drive/:driveId — recruiter, own company only
router.get('/drive/:driveId', verifyToken, requireRole('recruiter'), async (req, res) => {
  try {
    const driveId = parseInt(req.params.driveId);
    if (isNaN(driveId)) return res.status(400).json({ error: true, message: 'Invalid drive ID' });

    const scope = await pool.query(
      `SELECT d.id
       FROM drives d
       JOIN recruiters dr ON dr.id = d.recruiter_id
       JOIN recruiters me ON me.company_id = dr.company_id
       WHERE d.id = $1 AND me.user_id = $2`,
      [driveId, req.user.userId]
    );
    if (scope.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Drive not found' });
    }

    const result = await pool.query(
      `SELECT a.id, a.applied_at, a.resume_id,
              u.name, u.email, u.mobile_number,
              s.roll_number, s.degree, s.branch, s.cgpa, s.active_backlogs, s.passing_year,
              ${ROUND_FIELDS}
       FROM applications a
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       LEFT JOIN drive_rounds cr ON cr.id = a.current_round_id
       WHERE a.drive_id = $1
       ORDER BY a.applied_at ASC`,
      [driveId]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('Drive applicants error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// Helper: load an application plus its drive's rounds, scoped to the recruiter's own company.
// Locks the row (FOR UPDATE) so two recruiters can't act on the same application at once.
async function loadOwnedApplication(client, applicationId, userId) {
  const appResult = await client.query(
    `SELECT a.*, d.recruiter_id AS drive_recruiter_id
     FROM applications a
     JOIN drives d ON d.id = a.drive_id
     JOIN recruiters dr ON dr.id = d.recruiter_id
     JOIN recruiters me ON me.company_id = dr.company_id
     WHERE a.id = $1 AND me.user_id = $2
     FOR UPDATE OF a`,
    [applicationId, userId]
  );
  if (appResult.rows.length === 0) return null;

  const roundsResult = await client.query(
    `SELECT id, round_order, name FROM drive_rounds WHERE drive_id = $1 ORDER BY round_order`,
    [appResult.rows[0].drive_id]
  );
  return { application: appResult.rows[0], rounds: roundsResult.rows };
}

// Helper: fetch student's email/name + company/drive info for notification emails.
// Uses the pool (not the transaction client) because it runs after COMMIT.
async function getMailInfo(applicationId) {
  const result = await pool.query(
    `SELECT u.email, u.name,
            c.name AS company_name,
            d.title AS drive_title,
            d.package_or_stipend
     FROM applications a
     JOIN students s ON s.id = a.student_id
     JOIN users u ON u.id = s.user_id
     JOIN drives d ON d.id = a.drive_id
     JOIN recruiters r ON r.id = d.recruiter_id
     JOIN companies c ON c.id = r.company_id
     WHERE a.id = $1`,
    [applicationId]
  );
  return result.rows[0] || null;
}

// PATCH /api/applications/:id/advance — move to the next round
router.patch('/:id/advance', verifyToken, requireRole('recruiter'), async (req, res) => {
  const client = await pool.connect();
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: true, message: 'Invalid application ID' });

    await client.query('BEGIN');
    const loaded = await loadOwnedApplication(client, id, req.user.userId);
    if (!loaded) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: true, message: 'Application not found' });
    }
    const { application, rounds } = loaded;

    if (application.outcome !== 'in_progress') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: true, message: `Cannot advance — outcome is already "${application.outcome}"` });
    }

    const currentIndex = rounds.findIndex((r) => r.id === application.current_round_id);
    if (currentIndex === -1 || currentIndex === rounds.length - 1) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: true, message: 'Already at the final round — use offer or reject instead' });
    }
    const nextRound = rounds[currentIndex + 1];

    const updated = await client.query(
      `UPDATE applications SET current_round_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [nextRound.id, id]
    );
    await client.query(
      `INSERT INTO status_history (application_id, status, changed_by) VALUES ($1, $2, $3)`,
      [id, `Advanced to ${nextRound.name}`, req.user.userId]
    );
    await client.query('COMMIT');

    // Send email AFTER commit. A failure here must not affect the response.
    try {
      const info = await getMailInfo(id);
      if (info) {
        await sendRoundUpdateEmail(
          info.email,
          info.name,
          info.company_name,
          rounds[currentIndex].name, // round just cleared
          nextRound.name             // round moved to
        );
      }
    } catch (mailErr) {
      console.error('Round update email failed:', mailErr.message);
    }

    res.json({ success: true, message: `Moved to ${nextRound.name}`, data: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Advance error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  } finally {
    client.release();
  }
});

// PATCH /api/applications/:id/reject
router.patch('/:id/reject', verifyToken, requireRole('recruiter'), async (req, res) => {
  const client = await pool.connect();
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: true, message: 'Invalid application ID' });

    await client.query('BEGIN');
    const loaded = await loadOwnedApplication(client, id, req.user.userId);
    if (!loaded) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: true, message: 'Application not found' });
    }

    const updated = await client.query(
      `UPDATE applications SET outcome = 'rejected', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    await client.query(
      `INSERT INTO status_history (application_id, status, changed_by) VALUES ($1, 'Rejected', $2)`,
      [id, req.user.userId]
    );
    await client.query('COMMIT');
    res.json({ success: true, message: 'Application rejected', data: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Reject error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  } finally {
    client.release();
  }
});

// PATCH /api/applications/:id/offer — only from the final round
router.patch('/:id/offer', verifyToken, requireRole('recruiter'), async (req, res) => {
  const client = await pool.connect();
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: true, message: 'Invalid application ID' });

    const deadlineDays = req.body.deadline_days !== undefined ? parseInt(req.body.deadline_days) : 7;
    if (isNaN(deadlineDays) || deadlineDays < 1 || deadlineDays > 60) {
      return res.status(400).json({ error: true, message: 'deadline_days must be between 1 and 60' });
    }

    await client.query('BEGIN');
    const loaded = await loadOwnedApplication(client, id, req.user.userId);
    if (!loaded) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: true, message: 'Application not found' });
    }
    const { application, rounds } = loaded;

    const lastRound = rounds[rounds.length - 1];
    if (application.current_round_id !== lastRound.id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: true, message: `Can only offer from the final round ("${lastRound.name}")` });
    }
    if (application.outcome !== 'in_progress') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: true, message: `Cannot offer — outcome is already "${application.outcome}"` });
    }

    const updated = await client.query(
      `UPDATE applications SET outcome = 'offer', offer_expires_at = NOW() + ($1 || ' days')::INTERVAL, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [deadlineDays, id]
    );
    await client.query(
      `INSERT INTO status_history (application_id, status, changed_by) VALUES ($1, $2, $3)`,
      [id, `Offer extended — respond within ${deadlineDays} days`, req.user.userId]
    );
    await client.query('COMMIT');

    // Send email AFTER commit. A failure here must not affect the response.
    try {
      const info = await getMailInfo(id);
      if (info) {
        await sendOfferEmail(
          info.email,
          info.name,
          info.company_name,
          info.drive_title,
          info.package_or_stipend,
          deadlineDays
        );
      }
    } catch (mailErr) {
      console.error('Offer email failed:', mailErr.message);
    }

    res.json({ success: true, message: 'Offer extended', data: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Offer error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  } finally {
    client.release();
  }
});

// PATCH /api/applications/:id/correct — fix a recruiter mistake: set round and/or outcome directly
router.patch('/:id/correct', verifyToken, requireRole('recruiter'), async (req, res) => {
  const client = await pool.connect();
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: true, message: 'Invalid application ID' });

    const { round_order, outcome, reason } = req.body;
    if (round_order === undefined && outcome === undefined) {
      return res.status(400).json({ error: true, message: 'Provide round_order and/or outcome to correct' });
    }
    if (outcome !== undefined && !['in_progress', 'offer', 'rejected'].includes(outcome)) {
      return res.status(400).json({ error: true, message: 'Invalid outcome' });
    }

    await client.query('BEGIN');
    const loaded = await loadOwnedApplication(client, id, req.user.userId);
    if (!loaded) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: true, message: 'Application not found' });
    }
    const { rounds } = loaded;

    let targetRoundId = loaded.application.current_round_id;
    let targetRoundName = null;
    if (round_order !== undefined) {
      const target = rounds.find((r) => r.round_order === round_order);
      if (!target) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: true, message: 'round_order does not exist for this drive' });
      }
      targetRoundId = target.id;
      targetRoundName = target.name;
    }
    const targetOutcome = outcome !== undefined ? outcome : loaded.application.outcome;

    const updated = await client.query(
      `UPDATE applications SET current_round_id = $1, outcome = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [targetRoundId, targetOutcome, id]
    );

    const note = reason && reason.trim() ? ` (${reason.trim()})` : '';
    const description = `Corrected` +
      (round_order !== undefined ? ` — round set to ${targetRoundName}` : '') +
      (outcome !== undefined ? ` — outcome set to ${targetOutcome}` : '') +
      note;

    await client.query(
      `INSERT INTO status_history (application_id, status, changed_by) VALUES ($1, $2, $3)`,
      [id, description, req.user.userId]
    );
    await client.query('COMMIT');
    res.json({ success: true, message: 'Application corrected', data: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Correct error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  } finally {
    client.release();
  }
});

const { expireIfPastDeadline } = require('./offerExpiry');

// POST /api/applications/:id/accept-offer — student accepts, locks them from further drives
router.post('/:id/accept-offer', verifyToken, requireRole('student'), async (req, res) => {
  const client = await pool.connect();
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: true, message: 'Invalid application ID' });

    await client.query('BEGIN');

    // Lock the student row first — this is what serializes two simultaneous accept clicks.
    const studentResult = await client.query(
      `SELECT s.id, s.placement_status
       FROM applications a
       JOIN students s ON s.id = a.student_id
       WHERE a.id = $1 AND s.user_id = $2
       FOR UPDATE OF s`,
      [id, req.user.userId]
    );
    if (studentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: true, message: 'Application not found' });
    }
    const student = studentResult.rows[0];

    if (student.placement_status === 'placed') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: true, message: 'You have already accepted an offer elsewhere' });
    }

    const appResult = await client.query(`SELECT * FROM applications WHERE id = $1 FOR UPDATE`, [id]);
    let application = appResult.rows[0];

    const expired = await expireIfPastDeadline(client, application);
    if (expired) {
      await client.query('ROLLBACK');
      return res.status(410).json({ error: true, message: 'This offer has expired — the response deadline passed and it was not accepted' });
    }

    if (application.outcome !== 'offer') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: true, message: `Cannot accept — outcome is "${application.outcome}", not "offer"` });
    }

    await client.query(
      `UPDATE applications SET outcome = 'offer_accepted', updated_at = NOW() WHERE id = $1`,
      [id]
    );
    await client.query(
      `INSERT INTO status_history (application_id, status, changed_by) VALUES ($1, 'Offer accepted by student', $2)`,
      [id, req.user.userId]
    );

    // Auto-withdraw every other open application for this student
    const withdrawn = await client.query(
      `UPDATE applications SET outcome = 'withdrawn', updated_at = NOW()
       WHERE student_id = $1 AND id != $2 AND outcome IN ('in_progress', 'offer')
       RETURNING id`,
      [student.id, id]
    );
    for (const row of withdrawn.rows) {
      await client.query(
        `INSERT INTO status_history (application_id, status, changed_by) VALUES ($1, 'Withdrawn — student accepted an offer elsewhere', $2)`,
        [row.id, req.user.userId]
      );
    }

    await client.query(
      `UPDATE students SET placement_status = 'placed' WHERE id = $1`,
      [student.id]
    );

    await client.query('COMMIT');
    res.json({
      success: true,
      message: 'Offer accepted',
      withdrawn_applications: withdrawn.rows.length
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Accept offer error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  } finally {
    client.release();
  }
});

// POST /api/applications/:id/decline-offer — student declines, optional reason
router.post('/:id/decline-offer', verifyToken, requireRole('student'), async (req, res) => {
  const client = await pool.connect();
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: true, message: 'Invalid application ID' });

    const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : null;

    await client.query('BEGIN');

    const appResult = await client.query(
      `SELECT a.* FROM applications a
       JOIN students s ON s.id = a.student_id
       WHERE a.id = $1 AND s.user_id = $2
       FOR UPDATE OF a`,
      [id, req.user.userId]
    );
    if (appResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: true, message: 'Application not found' });
    }
    const application = appResult.rows[0];

    const expired = await expireIfPastDeadline(client, application);
    if (expired) {
      await client.query('ROLLBACK');
      return res.status(410).json({ error: true, message: 'This offer has already expired' });
    }

    if (application.outcome !== 'offer') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: true, message: `Cannot decline — outcome is "${application.outcome}", not "offer"` });
    }

    await client.query(
      `UPDATE applications SET outcome = 'offer_declined', decline_reason = $1, updated_at = NOW() WHERE id = $2`,
      [reason, id]
    );
    await client.query(
      `INSERT INTO status_history (application_id, status, changed_by) VALUES ($1, $2, $3)`,
      [id, `Offer declined by student${reason ? ` — ${reason}` : ''}`, req.user.userId]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Offer declined' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Decline offer error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;