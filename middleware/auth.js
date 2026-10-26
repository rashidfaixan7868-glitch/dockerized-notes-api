const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if(!header) return res.status(401).json({error: 'token required' });

    const token = header.split(' ')[1];
    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    }catch(err){
        return res.status(401).json({ error: 'invalid or expired token' });
    }
}
module.exports = requireAuth;