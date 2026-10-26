const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/', async(req , res)=>{
    try {
        const [rows] = await pool.query( 'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',[req.user.id]);
        res.json(rows);
    }catch(err){
        console.error(err);
        res.status(500).json( {error: 'something went wrong'});
    }
});

router.post('/', async(req , res)=> {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({error: 'message is required '});
        
        const [result] = await pool.query('INSERT INTO todos (message, user_id) VALUES (?, ?)', [message,req.user.id]);
        res.status(201).json({id: result.insertId, message});
    }catch(err){
        console.error(err);
        res.status(500).json({error: 'something went wrong'});
    }
});

module.exports = router;