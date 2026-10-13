const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());


const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'qwerty';
const MYSQL_DB = process.env.MYSQL_DB || 'testdb';
const MYSQL_PORT = process.env.MYSQL_PORT || 3306;

let pool;

async function initDB() {
  pool = mysql.createPool({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DB,
    port: MYSQL_PORT,
    waitForConnections: true,
    connectionLimit: 5
  });

  // Create the notes table if it doesn't exist yet
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      message VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Connected to MySQL and ensured notes table exists');
}

// Routes
app.get('/', (req, res) => {
  res.send('🚀 SQL testapp is running! Try GET /notes or POST /notes');
});

app.get('/notes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notes ORDER BY created_at DESC');
    res.json(rows);
  }catch (err) {
    console.error(err);
    res.status(500).json({ error: 'something went wrong' });
  }
});

app.post('/notes', async (req, res) => {
  try {
    const { message } = req.body;
      if (!message) return res.status(400).json({ error: 'message is required' });
      if (message.length > 255) return res.status(400).json({ error: 'message too long (max 255 characters)' });

    const [result] = await pool.query('INSERT INTO notes (message) VALUES (?)', [message]);
    res.status(201).json({ id: result.insertId, message });
  }catch (err){
    console.error(err);
    res.status(500).json({ error: 'something went wrong' });
  }
});

app.delete('/notes/:id', async(req,res) => {
  try {
    const { id } = req.params;
    const [ result ] = await pool.query ('DELETE FROM notes WHERE id = ?' , [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json ({ error: 'notes not found' });
    }
    res.json({ message: 'notes deleted' });
  }catch (err){
    console.error(err);
    res.status(500).json({error: 'something went wrong' });
  }
});

app.put ('/notes/:id', async(req,res)=>{
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });
    const [ result ] = await pool.query('UPDATE notes SET message = ? WHERE id = ?',[message, id]);

    if (result.affectedRows === 0 ){
      return res.status(404).json({ error: 'notes not found' });
    }
    res.status(200).json({message,id});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'something went wrong' });
  }
});

const PORT = process.env.PORT || 3000;

// Retry connecting to MySQL since it can take a few seconds to be ready
async function start() {
  let connected = false;
  while (!connected) {
    try {
      await initDB();
      connected = true;
    } catch (err) {
      console.log('⏳ Waiting for MySQL to be ready...', err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
}

start();
