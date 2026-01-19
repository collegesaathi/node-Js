const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const prisma = require("../config/prisma");

// Signup / Register
exports.register = catchAsync(async (req, res) => {
  try {
    const { full_name, email, password, confirm_password } = req.body;

    if (!full_name || !email || !password || !confirm_password) {
      return validationErrorResponse(res, "All fields are required", 400);
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return validationErrorResponse(res, "Invalid email address", 400);
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return validationErrorResponse(
        res,
        "Password must be at least 8 characters, include at least one letter, one uppercase letter, and one special character",
        400
      );
    }

    if (password !== confirm_password) {
      return validationErrorResponse(res, "Passwords do not match", 400);
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(res, "Email already registered", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: { full_name, email, password: hashedPassword, role_id: 3 },
    });

    return successResponse(res, "User registered successfully", 201, {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
    });
  } catch (error) {
    return errorResponse(error, "Something went wrong", 400);

  }
});

// Login
exports.login = catchAsync(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return validationErrorResponse(res, "Email and password are required", 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return errorResponse(res, "Invalid email or password", 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, "Invalid email or password", 401);

    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    return successResponse(res, "Login successful", 200, { user: { id: user.id, full_name: user.full_name, email: user.email }, token });
  } catch (error) {
    return errorResponse(res, "Something went wrong", 400);

  }
});

// Get User Info
exports.getUser = catchAsync(async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) return errorResponse(res, "Invalid User", 401);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, full_name: true, email: true, role_id: true },
    });

    if (!user) return errorResponse(res, "Invalid User", 401);

    return successResponse(res, "User retrieved successfully", 200, { user });
  } catch (error) {
    return errorResponse(error, "Something went wrong", 400);

  }
});

// Logout
exports.logout = catchAsync(async (req, res) => {
  try {
    const token = req.token;
    if (!token) return validationErrorResponse(res, "Token missing", 400);

    await prisma.blacklistedToken.create({ data: { token, user_id: req.user.id } });

    return successResponse(res, "Logged out successfully", 200, {});
  } catch (error) {
    return errorResponse(error, "Something went wrong", 400);

  }
});
