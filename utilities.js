const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const tokin = authHeader && authHeader.split(" ")[1];

  if (!tokin) return res.status(403).json({ message: "no tokin provider"});

  jwt.verify(tokin, process.env.ACCESS_TOKIN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
  }
  req.user = user;
    next();
  });
}



module.exports = {
    authenticateToken
}
