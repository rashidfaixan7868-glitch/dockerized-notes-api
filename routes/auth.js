const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/signup',async(req , res) =>{
    try {
        const { email, password } = req.body;

        if (!email || !password ) return res.status(400).json({error: 'emails and password are required '});

        const passwordHash = await bcrypt.hash(password,10);
        const [ result ] = await pool.query('INSERT INTO users (email, password_hash) VALUES (?, ?)',[email,passwordHash]);
        res.status(201).json({id: result.insertId, email});
    }catch(err){
        if (err.code ==='ER_DUP_ENTRY'){
            console.error(err);
            res.status(409).json({error: 'email already registered'});
        }
        else {
            console.error(err);
            res.status(500).json({error: 'something went wrong '});
        }
    }
});

router.post ('/login', async (req , res)=>{
    try{
        const { email, password } = req.body;
        if (!email || !password ) return res.status(400).json({error: 'email and password are required'});

        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?',[email]);
        if (rows.length === 0) return res.status(401).json({error: 'invalid email or password'});
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({error: 'invalid email or password'});

        const token = jwt.sign({ id: user.id } , process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({message: 'login successful', token});
    }catch(err){
        console.error(err);
        res.status(500).json({error: 'something went wrong'});
    }
});

module.exports = router;