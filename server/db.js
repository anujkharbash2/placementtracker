require('dotenv').config();  //loads the env file value into process.env(neeche code me dekho), taki baaki ki file read kr le unn values ko
const { Pool } = require('pg');//(pg)->pool, pool manage multiple db connections, reuse krta instead new connection everytime

const pool = new Pool({   //(new pool ->  yeh .env values ko use krke  pool banata hai)
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = pool; 