import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decode) => {
    if (err) {
      console.error("Token verification failed:", err);
      return res.status(403).json({ error: { name: err.name, message: err.message } });
    }
    req.user = decode;
    next();
  });
};
