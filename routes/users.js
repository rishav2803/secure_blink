const express = require("express");
const router = express.Router();
const User = require("../models/users");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;
  console.log(email, password);

  try {
    const newUser = new User(email, password, role || "user");
    const mssg = await newUser.save();
    res.status(201).json(mssg);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
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

    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/all", async (req, res) => {
  const users = await User.get();
  res.json({
    users,
  });
});

module.exports = router;
