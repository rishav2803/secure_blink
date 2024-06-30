const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticate");

//Store has a single admin
//just consider cuz there is no db
const store = {
  store_name: "Rishav",
  items: ["Parle", "pepsi"],
};

//both user and admin can access the items

module.exports = (logger) => {
  router.get("/all", authenticateToken, async (req, res) => {
    logger.info("Store Items Accessed");
    return res.json({
      items: store.items,
    });
  });

  //only admin can add the items
  router.post("/add", authenticateToken, async (req, res) => {
    const userRole = req.user.role;
    const { items } = req.body;

    if (userRole !== "admin") {
      logger.info("User(Store Employee) trying to add new item");
      return res.status(403).json({ message: "Forbidden" });
    }

    store.items = [...items, ...store.items];

    logger.info("Item added successfully");
    return res.json({
      mssg: "Successfully added the items",
      items: store.items,
    });
  });
  return router;
};
