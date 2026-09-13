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