const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Middleware to protect routes and ensure the user is authenticated
exports.protect = async (req, res, next) => {
  let token;

  // Check if authorization header is present and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // If no token is found in the headers, respond with error
  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to request object, excluding sensitive fields like otp
    req.user = await User.findById(decoded.id).select("-otp -otpExpiry");

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error("Token verification error:", err.message); // Log the error for debugging

    // Return response with detailed error message
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

// Middleware for admin-specific routes, ensures the user is an admin
exports.adminOnly = (req, res, next) => {
  // Check if the user is an admin
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    // If user is not admin, return forbidden error
    res.status(403).json({ message: "Admin access required" });
  }
};
