const express = require("express");
const dotenv = require("dotenv");
const userRouter = require("./routes/users");
const storeRouter = require("./routes/store");
const bodyParser = require("body-parser");
const winston = require("winston");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Register the user routes
app.use("/", userRouter(logger));

// Register the store routes
app.use("/store", storeRouter(logger));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
