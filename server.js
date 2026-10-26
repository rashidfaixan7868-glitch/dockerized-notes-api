const express = require('express');
const { initDB } = require('./db');
const notesRouter = require('./routes/notes');
const todosRouter = require('./routes/todos');
const authRouter = require('./routes/auth');
const requireAuth = require('./middleware/auth');

const app = express();
app.use(express.json());
app.use('/notes', requireAuth, notesRouter);
app.use('/todos', requireAuth, todosRouter);
app.use('/auth', authRouter);

app.get('/', (req, res) => {
  res.send('🚀 SQL testapp is running! Try GET /notes or POST /notes');
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
