const pool = require('./db');//req. la pata hai hi ki import krta hai jo naya pool banaya db.js me 

async function testConnection() {
  try {
    const result = await pool.query('SELECT 1 + 1 AS result'); //yeh query run krta hai and yeh suceed krta hai toh apne db creds sab sahi, 
    console.log('Connection successful. Test query result:', result.rows[0]); // return query result as row
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await pool.end();  //pool ko close krta hai, jai ho!!
  }
}

testConnection();

// try catch - error wali bkc 