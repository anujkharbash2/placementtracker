require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());


const authRoutes = require('./authRoutes');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});