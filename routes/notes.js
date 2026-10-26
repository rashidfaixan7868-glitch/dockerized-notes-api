const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM  notes WHERE user_id = ? ORDER BY created_at DESC',[req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'something went wrong' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
      if (!message) return res.status(400).json({ error: 'message is required' });
      if (message.length > 255) return res.status(400).json({ error: 'message too long (max 255 characters)' });

    const [result] = await pool.query('INSERT INTO notes (message, user_id) VALUES (?,?)', [message,req.user.id]);
    res.status(201).json({ id: result.insertId, message });
  }catch (err){
    console.error(err);
    res.status(500).json({ error: 'something went wrong' });
  }
});

router.delete('/:id', async(req,res) => {
  try {
    const { id } = req.params;
    const [ result ] = await pool.query ('DELETE FROM notes WHERE id = ? AND user_id = ?' , [id,req.user.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json ({ error: 'notes not found' });
    }
    res.json({ message: 'notes deleted' });
  }catch (err){
    console.error(err);
    res.status(500).json({error: 'something went wrong' });
  }
});

router.put ('/:id', async(req,res)=>{
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });
    const [ result ] = await pool.query('UPDATE notes SET message = ? WHERE id = ? AND user_id = ?',[message, id, req.user.id]);

    if (result.affectedRows === 0 ){
      return res.status(404).json({ error: 'notes not found' });
    }
    res.status(200).json({message,id});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'something went wrong' });
  }
});

module.exports = router;