const express = require('express');
const router = express.Router();
const pool = require('./db');
const { verifyToken, requireRole } = require('./authMiddleware');

// ---------- GET /api/dashboard/admin ----------
router.get('/admin', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const [
      studentCounts, companyCount, recruiterCount, driveCounts, offersAccepted,
      pendingDrives, expiringOffers, incompleteProfiles,
      byBranch, last30, outcomes, activity
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total,
                         COUNT(*) FILTER (WHERE placement_status = 'placed')::int AS placed
                  FROM students`),
      pool.query(`SELECT COUNT(*)::int AS count FROM companies`),
      pool.query(`SELECT COUNT(*)::int AS count FROM recruiters`),
      pool.query(`SELECT
                    COUNT(*) FILTER (WHERE approval_status = 'approved'
                      AND (application_deadline IS NULL OR application_deadline >= NOW()))::int AS active,
                    COUNT(*) FILTER (WHERE approval_status = 'pending')::int AS pending
                  FROM drives`),
      pool.query(`SELECT COUNT(*)::int AS count FROM applications WHERE outcome = 'offer_accepted'`),

      pool.query(`SELECT d.id, d.title, d.type, c.name AS company_name, r.name AS recruiter_name,
                         d.created_at, d.application_deadline
                  FROM drives d
                  JOIN recruiters r ON r.id = d.recruiter_id
                  JOIN companies c ON c.id = r.company_id
                  WHERE d.approval_status = 'pending'
                  ORDER BY d.created_at DESC, d.id DESC
                  LIMIT 5`),
      pool.query(`SELECT a.id AS application_id, u.name AS student_name, s.roll_number,
                         d.title AS drive_title, c.name AS company_name, a.offer_expires_at
                  FROM applications a
                  JOIN students s ON s.id = a.student_id
                  JOIN users u ON u.id = s.user_id
                  JOIN drives d ON d.id = a.drive_id
                  JOIN recruiters r ON r.id = d.recruiter_id
                  JOIN companies c ON c.id = r.company_id
                  WHERE a.outcome = 'offer'
                    AND a.offer_expires_at IS NOT NULL
                    AND a.offer_expires_at BETWEEN NOW() AND NOW() + INTERVAL '3 days'
                  ORDER BY a.offer_expires_at ASC
                  LIMIT 10`),
      pool.query(`SELECT COUNT(*)::int AS count FROM students
                  WHERE cgpa IS NULL OR passing_year IS NULL
                     OR COALESCE(branch, '') = '' OR COALESCE(degree, '') = ''`),

      pool.query(`SELECT branch,
                         COUNT(*)::int AS total_students,
                         COUNT(*) FILTER (WHERE placement_status = 'placed')::int AS placed_students,
                         ROUND(100.0 * COUNT(*) FILTER (WHERE placement_status = 'placed') / COUNT(*), 1) AS placement_percentage
                  FROM students
                  WHERE COALESCE(branch, '') <> ''
                  GROUP BY branch
                  ORDER BY branch`),
      // Every one of the last 30 IST days, including days with zero applications
      pool.query(`WITH days AS (
                    SELECT generate_series(
                      (NOW() AT TIME ZONE 'Asia/Kolkata')::date - 29,
                      (NOW() AT TIME ZONE 'Asia/Kolkata')::date,
                      INTERVAL '1 day')::date AS day
                  )
                  SELECT to_char(days.day, 'YYYY-MM-DD') AS date, COUNT(a.id)::int AS count
                  FROM days
                  LEFT JOIN applications a
                    ON (a.applied_at AT TIME ZONE 'Asia/Kolkata')::date = days.day
                  GROUP BY days.day
                  ORDER BY days.day`),
      pool.query(`SELECT outcome, COUNT(*)::int AS count
                  FROM applications GROUP BY outcome ORDER BY count DESC`),

      pool.query(`SELECT sh.id, sh.application_id, sh.status AS event, sh.changed_at,
                         su.name AS student_name, d.title AS drive_title, c.name AS company_name,
                         cb.name AS changed_by_name
                  FROM status_history sh
                  JOIN applications a ON a.id = sh.application_id
                  JOIN students s ON s.id = a.student_id
                  JOIN users su ON su.id = s.user_id
                  JOIN drives d ON d.id = a.drive_id
                  JOIN recruiters r ON r.id = d.recruiter_id
                  JOIN companies c ON c.id = r.company_id
                  LEFT JOIN users cb ON cb.id = sh.changed_by
                  WHERE sh.status <> 'Seeded application'
                  ORDER BY sh.changed_at DESC, sh.id DESC
                  LIMIT 10`),
    ]);

    const total = studentCounts.rows[0].total;
    const placed = studentCounts.rows[0].placed;

    res.json({
      success: true,
      data: {
        generated_at: new Date().toISOString(),
        cards: {
          total_students: total,
          placed_students: placed,
          placement_percentage: total > 0 ? Number((100 * placed / total).toFixed(1)) : 0,
          total_companies: companyCount.rows[0].count,
          total_recruiters: recruiterCount.rows[0].count,
          active_drives: driveCounts.rows[0].active,
          pending_approvals: driveCounts.rows[0].pending,
          offers_accepted: offersAccepted.rows[0].count,
        },
        needs_attention: {
          pending_drives: pendingDrives.rows,
          expiring_offers: expiringOffers.rows,
          incomplete_profiles_count: incompleteProfiles.rows[0].count,
        },
        charts: {
          placement_by_branch: byBranch.rows.map((r) => ({
            ...r, placement_percentage: Number(r.placement_percentage),
          })),
          applications_last_30_days: last30.rows,
          outcome_breakdown: outcomes.rows,
        },
        recent_activity: activity.rows,
      },
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: true, message: 'Failed to load dashboard' });
  }
});

// ---------- GET /api/dashboard/recruiter ----------
router.get('/recruiter', verifyToken, requireRole('recruiter'), async (req, res) => {
  try {
    const me = await pool.query(
      `SELECT r.id, r.company_id, c.name AS company_name
       FROM recruiters r JOIN companies c ON c.id = r.company_id
       WHERE r.user_id = $1`,
      [req.user.userId]
    );
    if (me.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Recruiter profile not found' });
    }
    const { id: recruiterId, company_id: companyId, company_name } = me.rows[0];
    const mine = req.query.mine === 'true';

    // Every query below joins `recruiters dr ON dr.id = d.recruiter_id` and uses this scope.
    // Placeholders are exactly $1 (company) and, when mine=true, $2 (recruiter).
    const scope = mine ? 'dr.company_id = $1 AND d.recruiter_id = $2' : 'dr.company_id = $1';
    const scopeParams = mine ? [companyId, recruiterId] : [companyId];

    const [
      driveCounts, appCounts, rejectedDrives, awaiting, stale,
      driveList, recentApplicants
    ] = await Promise.all([
      pool.query(`SELECT
                    COUNT(*) FILTER (WHERE d.approval_status = 'pending')::int AS pending,
                    COUNT(*) FILTER (WHERE d.approval_status = 'approved')::int AS approved,
                    COUNT(*) FILTER (WHERE d.approval_status = 'rejected')::int AS rejected,
                    COUNT(*) FILTER (WHERE d.approval_status = 'approved'
                      AND (d.application_deadline IS NULL OR d.application_deadline >= NOW()))::int AS active
                  FROM drives d JOIN recruiters dr ON dr.id = d.recruiter_id
                  WHERE ${scope}`, scopeParams),
      pool.query(`SELECT
                    COUNT(*)::int AS total,
                    COUNT(*) FILTER (WHERE a.outcome IN ('offer','offer_accepted','offer_declined','offer_expired'))::int AS extended,
                    COUNT(*) FILTER (WHERE a.outcome = 'offer_accepted')::int AS accepted,
                    COUNT(*) FILTER (WHERE a.outcome = 'offer_declined')::int AS declined
                  FROM applications a
                  JOIN drives d ON d.id = a.drive_id
                  JOIN recruiters dr ON dr.id = d.recruiter_id
                  WHERE ${scope}`, scopeParams),

      pool.query(`SELECT d.id, d.title, d.rejection_reason, d.reviewed_at
                  FROM drives d JOIN recruiters dr ON dr.id = d.recruiter_id
                  WHERE ${scope} AND d.approval_status = 'rejected'
                  ORDER BY d.reviewed_at DESC NULLS LAST
                  LIMIT 10`, scopeParams),
      pool.query(`SELECT a.id AS application_id, u.name AS student_name, s.roll_number,
                         d.id AS drive_id, d.title AS drive_title, a.offer_expires_at
                  FROM applications a
                  JOIN students s ON s.id = a.student_id
                  JOIN users u ON u.id = s.user_id
                  JOIN drives d ON d.id = a.drive_id
                  JOIN recruiters dr ON dr.id = d.recruiter_id
                  WHERE ${scope} AND a.outcome = 'offer'
                  ORDER BY a.offer_expires_at ASC NULLS LAST
                  LIMIT 10`, scopeParams),
      pool.query(`SELECT a.id AS application_id, u.name AS student_name,
                         d.id AS drive_id, d.title AS drive_title,
                         cr.name AS current_round_name, a.updated_at,
                         FLOOR(EXTRACT(EPOCH FROM (NOW() - a.updated_at)) / 86400)::int AS days_waiting
                  FROM applications a
                  JOIN students s ON s.id = a.student_id
                  JOIN users u ON u.id = s.user_id
                  JOIN drives d ON d.id = a.drive_id
                  JOIN recruiters dr ON dr.id = d.recruiter_id
                  LEFT JOIN drive_rounds cr ON cr.id = a.current_round_id
                  WHERE ${scope}
                    AND d.approval_status = 'approved'
                    AND a.outcome = 'in_progress'
                    AND a.updated_at < NOW() - INTERVAL '7 days'
                  ORDER BY a.updated_at ASC
                  LIMIT 10`, scopeParams),

      pool.query(`SELECT d.id AS drive_id, d.title, d.approval_status, dr.name AS created_by_name,
                         (SELECT COUNT(*) FROM applications a WHERE a.drive_id = d.id)::int AS total_applicants
                  FROM drives d JOIN recruiters dr ON dr.id = d.recruiter_id
                  WHERE ${scope}
                  ORDER BY d.created_at DESC, d.id DESC
                  LIMIT 50`, scopeParams),
      pool.query(`SELECT a.id AS application_id, u.name AS student_name, s.roll_number,
                         s.branch, s.cgpa, d.id AS drive_id, d.title AS drive_title,
                         a.applied_at, cr.name AS current_round_name
                  FROM applications a
                  JOIN students s ON s.id = a.student_id
                  JOIN users u ON u.id = s.user_id
                  JOIN drives d ON d.id = a.drive_id
                  JOIN recruiters dr ON dr.id = d.recruiter_id
                  LEFT JOIN drive_rounds cr ON cr.id = a.current_round_id
                  WHERE ${scope}
                  ORDER BY a.applied_at DESC, a.id DESC
                  LIMIT 10`, scopeParams),
    ]);

    // Pipeline: per-round counts and outcome counts for the listed drives
    const driveIds = driveList.rows.map((d) => d.drive_id);
    const roundsByDrive = {};
    const outcomesByDrive = {};

    if (driveIds.length > 0) {
      const [roundRows, outcomeRows] = await Promise.all([
        // "Currently at each round" = applicants still in progress in that round
        pool.query(`SELECT r.drive_id, r.id AS round_id, r.round_order, r.name,
                           COUNT(a.id) FILTER (WHERE a.outcome = 'in_progress')::int AS count
                    FROM drive_rounds r
                    LEFT JOIN applications a ON a.current_round_id = r.id
                    WHERE r.drive_id = ANY($1)
                    GROUP BY r.id
                    ORDER BY r.drive_id, r.round_order`, [driveIds]),
        pool.query(`SELECT drive_id, outcome, COUNT(*)::int AS count
                    FROM applications
                    WHERE drive_id = ANY($1) AND outcome <> 'in_progress'
                    GROUP BY drive_id, outcome`, [driveIds]),
      ]);
      for (const r of roundRows.rows) {
        (roundsByDrive[r.drive_id] ||= []).push({
          round_id: r.round_id, round_order: r.round_order, name: r.name, count: r.count,
        });
      }
      for (const o of outcomeRows.rows) {
        (outcomesByDrive[o.drive_id] ||= {})[o.outcome] = o.count;
      }
    }

    const emptyOutcomes = () => ({
      offer: 0, offer_accepted: 0, offer_declined: 0, offer_expired: 0, rejected: 0, withdrawn: 0,
    });

    res.json({
      success: true,
      data: {
        generated_at: new Date().toISOString(),
        company: { id: companyId, name: company_name },
        mine,
        cards: {
          drives_pending: driveCounts.rows[0].pending,
          drives_approved: driveCounts.rows[0].approved,
          drives_rejected: driveCounts.rows[0].rejected,
          active_drives: driveCounts.rows[0].active,
          total_applicants: appCounts.rows[0].total,
          offers_extended: appCounts.rows[0].extended,
          offers_accepted: appCounts.rows[0].accepted,
          offers_declined: appCounts.rows[0].declined,
        },
        needs_attention: {
          rejected_drives: rejectedDrives.rows,
          offers_awaiting_response: awaiting.rows,
          stale_applicants: stale.rows,
        },
        pipeline: driveList.rows.map((d) => ({
          ...d,
          rounds: roundsByDrive[d.drive_id] || [],
          outcomes: { ...emptyOutcomes(), ...(outcomesByDrive[d.drive_id] || {}) },
        })),
        recent_applicants: recentApplicants.rows,
      },
    });
  } catch (err) {
    console.error('Recruiter dashboard error:', err);
    res.status(500).json({ error: true, message: 'Failed to load dashboard' });
  }
});

module.exports = router;