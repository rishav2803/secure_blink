const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const sendResetEmail = require("../utils/sendResetEmail");

const resetTokens = {};

module.exports = (logger) => {
  router.post(
    "/register",
    [
      // Validate email, password, and role fields
      body("email").isEmail().normalizeEmail(),
      body("password").notEmpty().trim().escape(),
      body("role").notEmpty().isIn(["user", "admin"]), // Example: Role should be "user" or "admin"
    ],
    async (req, res) => {
      logger.info("User trying to register");

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, role } = req.body;

      try {
        const newUser = new User(email, password, role || "user");
        const mssg = await newUser.save();
        logger.info("User registered successfully");
        res.status(201).json(mssg);
      } catch (error) {
        logger.info("SignUp failed");
        res.status(400).json({ message: error.message });
      }
    }
  );

  router.post(
    "/login",
    [
      // Validate email and password fields and role
      body("email").isEmail().normalizeEmail(),
      body("password").notEmpty().trim().escape(),
      body("role").optional().isIn(["user", "admin"]),
    ],
    async (req, res) => {
      logger.info("User trying to log in");

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, role } = req.body;

      try {
        // Perform user authentication
        const user = await User.check(email, password, role);

        // Generate JWT token
        const token = jwt.sign(
          {
            email: user.email,
            role: role,
          },
          process.env.ACCESS_SECRET_TOKEN,
          {
            expiresIn: "1h",
          }
        );

        logger.info(`User with email ${email} successfully logged in`);
        res.json({ token });
      } catch (error) {
        logger.info("SignIn failed");
        res.status(400).json({ message: error.message });
      }
    }
  );

  router.post(
    "/forgot-password",
    [
      // Validate email and password fields and role
      body("email").isEmail().normalizeEmail(),
    ],
    async (req, res) => {
      const { email } = req.body;

      try {
        // Find user by email
        const user = await User.findUserByEmail(email);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const token = jwt.sign(
          {
            email: user.email,
            role: user.role,
          },
          process.env.RESET_SECRET_TOKEN,
          { expiresIn: "15m" }
        );
        resetTokens[token] = email;

        // const resetLink = `http://localhost:3000/reset-password/${token}`;
        const resetLink = `https://secure-blink-yyrt.onrender.com/api/reset-password/${token}`;
        await sendResetEmail(email, resetLink);

        logger.info(`Password reset email sent to ${email}`);
        return res.json({
          message: "Password reset email sent",
        });
      } catch (error) {
        logger.error("Error requesting password reset", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }
  );

  router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.RESET_SECRET_TOKEN);
      const { email, exp } = decoded;

      // Check token expiration
      if (Date.now() >= exp * 1000) {
        return res.status(400).json({ message: "Token has expired" });
      }

      if (!email) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Check if the reset token exists in the resetTokens object
      if (!resetTokens[token]) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Check if the stored email matches the token's email
      if (resetTokens[token] !== email) {
        return res
          .status(400)
          .json({ message: "Invalid token for this email" });
      }

      // Verify if the user exists
      const user = await User.findUserByEmail(email);
      if (!user) {
        return res.status(404).send("User not found");
      }

      // Update the user's password
      const mssg = await User.updatePassword(password, email);

      // Delete the used reset token
      delete resetTokens[token];

      logger.info(`Password reset successfully for ${email}`);
      res.send(mssg);
    } catch (error) {
      logger.error("Error resetting password", error);
      res.status(400).send("Invalid or expired token");
    }
  });

  router.get("/all", async (req, res) => {
    const users = await User.get();
    res.json({ users });
  });

  return router;
};
