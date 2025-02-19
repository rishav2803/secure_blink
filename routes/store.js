const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const authenticateToken = require("../middleware/authenticate");

// Store has a single admin
const store = {
  store_name: "Rishav",
  items: ["Parle", "Pepsi"],
};

module.exports = (logger) => {
  //accesible by both the admin(store owner) and the user(store employee)
  router.get("/all", authenticateToken, async (req, res) => {
    try {
      logger.info("Store items accessed");
      return res.json({
        items: store.items,
      });
    } catch (error) {
      logger.error("Error fetching store items", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

  //only accesible by the admin
  router.post(
    "/add",
    [
      // Validate items array
      body("items")
        .isArray({ min: 1 })
        .withMessage("Items must be a non-empty array"),
      // Sanitize and validate each item in the array
      body("items.*").isString().trim().escape().notEmpty(),
    ],
    authenticateToken,
    async (req, res) => {
      const userRole = req.user.role;
      const { items } = req.body;

      // Check if user is admin
      if (userRole !== "admin") {
        logger.error("Unauthorized access: User is not an admin");
        return res.status(403).json({ message: "Forbidden" });
      }

      try {
        // Validate inputs
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          logger.error("Invalid input data");
          return res.status(400).json({ message: "Invalid input data" });
        }

        // Add items to store
        store.items = [...items, ...store.items];

        logger.info("Items added successfully");
        return res.json({
          message: "Successfully added the items",
          items: store.items,
        });
      } catch (error) {
        logger.error("Error adding items", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }
  );


  router.post(
    "/test-data",
    async (req, res) => {
      console.log("Request body is");
      console.log(req);
      return res.status(200).json({
        message: "Recieved the data",
        data : req
      })
    }
  );

  return router;
};
