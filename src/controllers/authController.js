const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const prisma = require("../config/prisma");
require("dotenv").config();

module.exports = {
  register: async (req, res) => {
    try {
      const { full_name, email, password, confirm_password } = req.body;

      if (!full_name || !email || !password || !confirm_password)
        return res.status(400).json({ error: "All fields are required" });

      if (!validator.isEmail(email))
        return res.status(400).json({ error: "Invalid email address" });

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

    if (!passwordRegex.test(password))
      return res.status(400).json({
        error:
          "Password must be at least 8 characters, include at least one letter, one uppercase letter, and one special character",
      });
      if (password !== confirm_password)
        return res.status(400).json({ error: "Passwords do not match" });

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser)
        return res.status(400).json({ error: "Email already registered" });

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { full_name, email, password: hashedPassword, role_id: 3 }
      });

        res.json({
            message: "User registered successfully",
            user: { id: user.id, full_name: user.full_name, email: user.email },
        });

    } catch (err) {
      res.status(500).json({ error: "Something went wrong" });
    }
  },


  login: async (req, res) => {
    try {
      const { email, password } = req.body;

        if (!email || !password)
        return res.status(400).json({ error: "Email and password are required" });

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(400).json({ error: "Invalid email or password" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

      const token = jwt.sign(
        { id: user.id, email: user.email, role_id: user.role_id },
        process.env.SECRET_KEY,
        { expiresIn: "1d" }
      );

      res.json({ message: "Login successful", token, user });

    } catch (error) {
      res.status(500).json({ error: "Something went wrong" });
    }
  },


  logout: async (req, res) => {
    try {
      await prisma.blacklistedToken.create({
        data: { token: req.token, user_id: req.user.id }
      });

      res.json({ message: "Logged out successfully" });

    } catch (err) {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
};
