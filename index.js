const express = require("express");
const dotenv = require("dotenv");
const userRouter = require("./routes/users");
const storeRouter = require("./routes/store");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//register the user routes
app.use("/", userRouter);

app.use("/store", storeRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
