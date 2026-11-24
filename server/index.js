require('dotenv').config();
const express = require('express');
const app = express();
const companyRoutes = require('./companyRoutes');

app.use(express.json());
const cors = require('cors');
app.use(cors());

const authRoutes = require('./authRoutes');
app.use('/api/auth', authRoutes);
const resumeRoutes = require('./resumeRoutes');
app.use('/api/resumes', resumeRoutes);

const applicationRoutes = require('./applicationRoutes');
app.use('/api/applications', applicationRoutes);

const userRoutes = require("./userRoutes");
app.use("/api", userRoutes);

const studentRoutes = require('./studentRoutes');
app.use('/api/students', studentRoutes);

app.use('/api/companies', companyRoutes);

const driveRoutes = require('./driveRoutes');
app.use('/api/drives', driveRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const dashboardRoutes = require('./dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: true, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: true, message: 'Something went wrong' });
});