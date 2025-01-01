const jwt = require('jsonwebtoken');
const SecretKey = "secretkey";

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) {
        return res.status(401).json({ message: "Authorization header missing!" });
    }
    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, SecretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token!" });
        }
        req.user = decoded;
        next();
    });
};

module.exports = {
    verifyToken,
};
