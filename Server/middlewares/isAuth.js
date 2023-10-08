const jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{
    const token = req.get('x-auth-token');
    if(!token){
        return res.send(401).json({errors: [{msg: 'Invalid token, not logged in'}]});
    }

    try {
        const verifiedToken = jwt.verify(token,process.env.JWT_SEC);
        req.user = verifiedToken.user;
        next();
    } catch (error) {
        res.status(401).json({errors: [{ msg: "Invalid token"}]});
    }
}