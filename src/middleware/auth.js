const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

module.exports = async function (req, res, next) {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader)
      return res.status(401).json({ error: "No token provided" });

      const parts = authHeader.split(" ");

      if (parts.length !== 2 || parts[0] !== "Bearer")
        return res.status(401).json({ error: "Invalid token format" });

        const token = parts[1];


        // 1️⃣ Check if token is blacklisted
        const blacklisted = await prisma.blacklistedToken.findFirst({
          where: { token }
        });

        if (blacklisted)
          return res.status(401).json({ error: "Token expired or logged out" });

          // 2️⃣ Validate JWT
          const decoded = jwt.verify(token, SECRET_KEY);

          req.user = decoded;
          req.token = token;

        next();
  } catch (err) {
    console.log("JWT ERROR:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
