const express = require("express");
const router = express.Router();
const User = require("../models/users");
const jwt = require("jsonwebtoken");

module.exports = (logger) => {
  router.post("/register", async (req, res) => {
    logger.info("User trying to register");
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
  });

  router.post("/login", async (req, res) => {
    try {
      logger.info("User trying to log in ");
      const { email, password, role } = req.body;
      //user Auth is performed first
      // email check and password check

      const user = await User.check(email, password);

      //if user then genreate token else it goes to the catch block

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
      logger.info(`User with email ${email} successfully logged in `);
      res.json({ token });
    } catch (error) {
      logger.info("SignIn  failed");
      res.status(400).json({ message: error.message });
    }
  });

  router.get("/all", async (req, res) => {
    const users = await User.get();
    res.json({
      users,
    });
  });

  return router;
};
