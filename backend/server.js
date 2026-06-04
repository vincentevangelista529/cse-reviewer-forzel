require('dotenv').config();
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

app.use(cors());
app.use(express.json());

const Database = require('better-sqlite3');
const db = new Database('cse-reviewer.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  );
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    category TEXT,
    difficulty TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS choices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    choice_text TEXT,
    is_correct INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    score INTEGER,
    total_questions INTEGER,
    category TEXT,
    taken_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

app.post('/register', async function(req, res) {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)')
      .run(username, hashedPassword, 'user');
    res.json({ success: true, message: 'User Registered!' });
  } catch(error) {
    res.status(500).json({ message: 'Username already exists!' });
  }
})

app.post('/login', async function(req, res) {
  const { username, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if(!user) return res.status(404).json({ message: 'User not found' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if(passwordMatch) {
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET);
      res.json({ success: true, token, username: user.username, role: user.role });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch(error) {
    res.status(500).json({ message: 'An error occurred' });
  }
})


app.post('/questions', function(req, res) {
  const { question, category, difficulty, choices } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
   
    if(decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only!' });
    }

   
    const result = db.prepare('INSERT INTO questions (question, category, difficulty) VALUES (?, ?, ?)')
      .run(question, category, difficulty);

    const questionId = result.lastInsertRowid;

   
    choices.forEach(choice => {
      db.prepare('INSERT INTO choices (question_id, choice_text, is_correct) VALUES (?, ?, ?)')
        .run(questionId, choice.text, choice.isCorrect ? 1 : 0);
    });

    res.json({ success: true, message: 'Question added!' });
  } catch(error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
})

app.get('/questions', function(req, res) {
  const questions = db.prepare('SELECT * FROM questions').all();
  res.json(questions);
})

app.delete('/questions/:id', function(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only!' });
    }

    const id = req.params.id;
    // delete choices first (they depend on the question)
    db.prepare('DELETE FROM choices WHERE question_id = ?').run(id);
    // then delete the question
    db.prepare('DELETE FROM questions WHERE id = ?').run(id);
    
    res.json({ success: true, message: 'Question deleted!' });
  } catch(error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
})

app.get('/quiz', function(req, res) {
  const { category, count, difficulty } = req.query;
  
  let query = `
    SELECT questions.*, 
    json_group_array(json_object(
      'id', choices.id,
      'text', choices.choice_text,
      'isCorrect', choices.is_correct
    )) as choices
    FROM questions
    LEFT JOIN choices ON questions.id = choices.question_id
  `;
  
  const conditions = [];
  const params = [];
  
  if(category && category !== 'all') {
    conditions.push('questions.category = ?');
    params.push(category);
  }
  if(difficulty && difficulty !== 'all') {
    conditions.push('questions.difficulty = ?');
    params.push(difficulty);
  }
  
  if(conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ` GROUP BY questions.id ORDER BY RANDOM() LIMIT ?`;
  params.push(Number(count) || 10);
  
  const questions = db.prepare(query).all(...params);
  
  const parsed = questions.map(q => ({
    ...q,
    choices: JSON.parse(q.choices)
  }));
  
  res.json(parsed);
})

app.listen(5000, function() {
  console.log('server running on http://localhost:5000')
})



app.listen(5000, function() {
  console.log('server running on http://localhost:5000')
})