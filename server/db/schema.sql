-- USERS
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  mobile_number VARCHAR(15),
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'recruiter', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
--COMPANIES 
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  industry VARCHAR(100),
  website VARCHAR(200),
  hr_email VARCHAR(150),
  address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
--STUDENTS
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  roll_number VARCHAR(30) UNIQUE NOT NULL,
  degree VARCHAR(20) NOT NULL,
  branch VARCHAR(50) NOT NULL,
  cgpa NUMERIC(4,2) CHECK (cgpa >= 0 AND cgpa <= 10),
  active_backlogs INTEGER DEFAULT 0 CHECK (active_backlogs >= 0),
  admission_year INTEGER NOT NULL,
  passing_year INTEGER NOT NULL,
  gender VARCHAR(20),
  category VARCHAR(20),
  placement_status VARCHAR(20) DEFAULT 'not_placed',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

--RECTUIRERS
CREATE TABLE recruiters (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  designation VARCHAR(100),
  official_email VARCHAR(150),
  mobile_number VARCHAR(15),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE drives (
  id SERIAL PRIMARY KEY,
  recruiter_id INTEGER NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approval_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  title VARCHAR(150) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('job', 'internship')),
  description TEXT,
  min_cgpa NUMERIC(4,2) CHECK (min_cgpa >= 0 AND min_cgpa <= 10),
  max_backlogs INTEGER CHECK (max_backlogs >= 0),
  allowed_branches TEXT[],
  allowed_degrees TEXT[],
  eligible_passing_years INTEGER[],
  package_or_stipend VARCHAR(100),
  job_location VARCHAR(150),
  number_of_openings INTEGER CHECK (number_of_openings > 0),
  application_deadline TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE resumes (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(100) NOT NULL UNIQUE,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  drive_id INTEGER NOT NULL REFERENCES drives(id) ON DELETE CASCADE,
  resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'applied'
    CHECK (status IN ('applied','shortlisted','test','interview','offer','rejected')),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, drive_id)
);

CREATE TABLE status_history (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE drive_rounds (
  id SERIAL PRIMARY KEY,
  drive_id INTEGER NOT NULL REFERENCES drives(id) ON DELETE CASCADE,
  round_order INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  UNIQUE (drive_id, round_order)
);

ALTER TABLE applications DROP COLUMN status;
ALTER TABLE applications ADD COLUMN current_round_id INTEGER REFERENCES drive_rounds(id);
ALTER TABLE applications ADD COLUMN outcome VARCHAR(20) NOT NULL DEFAULT 'in_progress'
  CHECK (outcome IN ('in_progress', 'offer', 'rejected'));

ALTER TABLE status_history ALTER COLUMN status TYPE VARCHAR(150);




ALTER TABLE applications DROP CONSTRAINT applications_outcome_check;
ALTER TABLE applications ADD CONSTRAINT applications_outcome_check
  CHECK (outcome IN ('in_progress', 'offer', 'offer_accepted', 'rejected', 'withdrawn'));

  ALTER TABLE applications ADD COLUMN offer_expires_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN decline_reason TEXT;