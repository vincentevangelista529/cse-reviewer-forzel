require('dotenv').config();
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Pool } = require('pg');

app.use(cors());
app.use(express.json());

// PostgreSQL connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create tables if they don't exist
async function initDB() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user'
    );
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      category TEXT,
      difficulty TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS choices (
      id SERIAL PRIMARY KEY,
      question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
      choice_text TEXT,
      is_correct INTEGER DEFAULT 0
    );
  `);
  console.log('Database initialized!');
}

initDB();

// REGISTER
app.post('/register', async function(req, res) {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      [username, hashedPassword, 'user']
    );
    res.json({ success: true, message: 'User Registered!' });
  } catch(error) {
    res.status(500).json({ message: 'Username already exists!' });
  }
});

// LOGIN
app.post('/login', async function(req, res) {
  const { username, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if(!user) return res.status(404).json({ message: 'User not found' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if(passwordMatch) {
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET
      );
      res.json({ success: true, token, username: user.username, role: user.role });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch(error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

// ADD QUESTION (admin only)
app.post('/questions', async function(req, res) {
  const { question, category, difficulty, choices } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only!' });
    }

    const result = await db.query(
      'INSERT INTO questions (question, category, difficulty) VALUES ($1, $2, $3) RETURNING id',
      [question, category, difficulty]
    );

    const questionId = result.rows[0].id;

    for(const choice of choices) {
      await db.query(
        'INSERT INTO choices (question_id, choice_text, is_correct) VALUES ($1, $2, $3)',
        [questionId, choice.text, choice.isCorrect ? 1 : 0]
      );
    }

    res.json({ success: true, message: 'Question added!' });
  } catch(error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// GET ALL QUESTIONS
app.get('/questions', async function(req, res) {
  const result = await db.query('SELECT * FROM questions');
  res.json(result.rows);
});

// DELETE QUESTION (admin only)
app.delete('/questions/:id', async function(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only!' });
    }
    await db.query('DELETE FROM questions WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Question deleted!' });
  } catch(error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// GET QUIZ QUESTIONS
app.get('/quiz', async function(req, res) {
  const { category, count, difficulty } = req.query;

  let query = `
    SELECT q.*, json_agg(json_build_object(
      'id', c.id,
      'text', c.choice_text,
      'isCorrect', c.is_correct
    )) as choices
    FROM questions q
    LEFT JOIN choices c ON q.id = c.question_id
  `;

  const conditions = [];
  const params = [];

  if(category && category !== 'all') {
    params.push(category);
    conditions.push(`q.category = $${params.length}`);
  }
  if(difficulty && difficulty !== 'all') {
    params.push(difficulty);
    conditions.push(`q.difficulty = $${params.length}`);
  }

  if(conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ` GROUP BY q.id ORDER BY RANDOM()`;

  params.push(Number(count) || 10);
  query += ` LIMIT $${params.length}`;

  const result = await db.query(query, params);
  res.json(result.rows);
});

// CREATE ADMIN ACCOUNT (run once, then remove this route!)
app.post('/setup-admin', async function(req, res) {
  const { username, password, secretKey } = req.body;
  if(secretKey !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: 'Wrong secret key!' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      [username, hashedPassword, 'admin']
    );
    res.json({ success: true, message: 'Admin created!' });
  } catch(error) {
    res.status(500).json({ message: 'Admin already exists!' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
  console.log(`Server running on port ${PORT}`);
});