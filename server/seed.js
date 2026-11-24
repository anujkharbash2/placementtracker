require('dotenv').config();
const pool = require('./db');

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Biotech', 'Chemical'];
const DEGREES = ['B.Tech', 'M.Tech', 'BCA', 'MCA'];
const PASSING_YEARS = [2025, 2026, 2027, 2028];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 2) => Number((Math.random() * (max - min) + min).toFixed(decimals));
const randSubset = (arr, count) => [...arr].sort(() => 0.5 - Math.random()).slice(0, count);

async function run() {
  const client = await pool.connect();
  try {
    console.log('Loading existing recruiters and students...');
    const recruitersResult = await client.query(`SELECT id FROM recruiters`);
    const recruiterIds = recruitersResult.rows.map(r => r.id);
    if (recruiterIds.length === 0) throw new Error('No recruiters found — run the full seed first.');

    const studentsResult = await client.query(`SELECT id FROM students`);
    const studentIds = studentsResult.rows.map(s => s.id);
    if (studentIds.length === 0) throw new Error('No students found — run the full seed first.');

    console.log(`Found ${recruiterIds.length} recruiters, ${studentIds.length} students.`);

    // ---------- Drives (150) ----------
    console.log('Creating drives...');
    const driveIds = [];
    for (let i = 0; i < 150; i++) {
      const recruiterId = rand(recruiterIds);
      const type = rand(['job', 'internship']);
      const packageLpa = type === 'job' ? randFloat(3.5, 25, 1) : randFloat(0.1, 1.2, 1);
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + randInt(-60, 30));

      const result = await client.query(
        `INSERT INTO drives (
          recruiter_id, title, type, description, min_cgpa, max_backlogs,
          allowed_branches, allowed_degrees, eligible_passing_years,
          package_or_stipend, package_lpa, job_location, number_of_openings,
          application_deadline
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        RETURNING id`,
        [
          recruiterId, `${type === 'job' ? 'SDE' : 'Intern'} Hiring ${i + 1}`, type,
          'Dummy drive generated for testing.', randFloat(5.5, 8.0), randInt(0, 2),
          randSubset(BRANCHES, randInt(2, 5)), randSubset(DEGREES, randInt(1, 2)),
          randSubset(PASSING_YEARS, randInt(1, 3)), `${packageLpa} LPA`, packageLpa,
          'Delhi NCR', randInt(1, 20), deadline.toISOString()
        ]
      );
      const driveId = result.rows[0].id;
      driveIds.push(driveId);

      const roundNames = rand([['Interview'], ['Aptitude', 'Technical', 'HR'], ['Online Test', 'Interview']]);
      for (let r = 0; r < roundNames.length; r++) {
        await client.query(
          `INSERT INTO drive_rounds (drive_id, round_order, name) VALUES ($1, $2, $3)`,
          [driveId, r + 1, roundNames[r]]
        );
      }
      if ((i + 1) % 25 === 0) console.log(`  ...${i + 1}/150 drives done`);
    }

    // ---------- Applications ----------
    console.log('Creating applications...');
    let appCount = 0;
    for (const studentId of studentIds) {
      const numApplications = randInt(0, 5);
      if (numApplications === 0) continue;

      const chosenDrives = randSubset(driveIds, numApplications);

      const resumeResult = await client.query(
        `INSERT INTO resumes (student_id, original_name, stored_name, file_size)
         VALUES ($1, 'resume.pdf', $2, 102400) RETURNING id`,
        [studentId, `dummy_${studentId}_${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`]
      );
      const resumeId = resumeResult.rows[0].id;

      let placedAlready = false;
      for (const driveId of chosenDrives) {
        if (placedAlready) break;

        const roundsResult = await client.query(
          `SELECT id, round_order FROM drive_rounds WHERE drive_id = $1 ORDER BY round_order`, [driveId]
        );
        const rounds = roundsResult.rows;
        const outcomeRoll = Math.random();
        let outcome = 'in_progress';
        let currentRoundIdx = randInt(0, rounds.length - 1);

        if (outcomeRoll < 0.15) {
          outcome = 'rejected';
        } else if (outcomeRoll < 0.25) {
          currentRoundIdx = rounds.length - 1;
          outcome = 'offer_accepted';
          placedAlready = true;
        } else if (outcomeRoll < 0.30) {
          currentRoundIdx = rounds.length - 1;
          outcome = 'offer_declined';
        } else if (outcomeRoll < 0.35) {
          currentRoundIdx = rounds.length - 1;
          outcome = 'offer';
        }

        try {
          const appResult = await client.query(
            `INSERT INTO applications (student_id, drive_id, resume_id, current_round_id, outcome)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [studentId, driveId, resumeId, rounds[currentRoundIdx].id, outcome]
          );
          await client.query(
            `INSERT INTO status_history (application_id, status, changed_by)
             VALUES ($1, 'Seeded application', NULL)`,
            [appResult.rows[0].id]
          );
          appCount++;
        } catch (err) {
          if (err.code !== '23505') throw err;
        }
      }

      if (placedAlready) {
        await client.query(`UPDATE students SET placement_status = 'placed' WHERE id = $1`, [studentId]);
      }
    }

    console.log(`Done. Created ${driveIds.length} drives, ${appCount} applications. All drives are PENDING — approve them via the admin UI.`);
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();