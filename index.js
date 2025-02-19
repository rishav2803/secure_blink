const express = require("express");
const dotenv = require("dotenv");
const userRouter = require("./routes/users");
const storeRouter = require("./routes/store");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const logger = require("./config/logger");
dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//secure header http
app.use(helmet());

// Register the user routes
app.use("/api", userRouter(logger));

// Register the store routes
app.use("/api/store", storeRouter(logger));


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
