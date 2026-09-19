require('dotenv').config();
const express = require('express');
const app = express();
const companyRoutes = require('./companyRoutes');

app.use(express.json());
const cors = require('cors');
app.use(cors());

const authRoutes = require('./authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require("./userRoutes");
app.use("/api", userRoutes);

app.use('/api/companies', companyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});