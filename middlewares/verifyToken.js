const jwt = require("jsonwebtoken");
require("dotenv").config();

const { ACCESS_TOKEN_SECRET } = process.env;

const verifyToken = (req, res, next) => {
  //console.log("Request Headers:", req.headers); // Log all headers

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token is invalid" });
    console.log("Decoded user:", user);
    req.user = { id: user.userid, email: user.email }; 
    next();
  });
};


module.exports = {
  verifyToken,
};
