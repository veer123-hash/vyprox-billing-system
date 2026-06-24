const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log("AUTH HEADER =>", req.headers.authorization);
  console.log("TOKEN =>", token);
  console.log("JWT_SECRET =>", process.env.JWT_SECRET);
  console.log("JWT ERROR =>", err.message);

  if (!token) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED USER =>", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT ERROR =>", err.message);

    return res.status(401).json({
      message: "Invalid token",
      error: err.message,
    });
  }
};

module.exports = authMiddleware;