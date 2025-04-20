const express = require("express");
const { PORT } = require("./consts/app");
const { rateLimit } = require("express-rate-limit");
// const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(
  rateLimit({
    windowMs: 10 * 1000,
    limit: 20,
  })
);
app.use(cookieParser());
app.use(express.json());

// app.use(cors());

const apiController = require("./controllers");
app.use("/api", apiController);

app.listen(PORT, () => {
  console.log(`Express Running on ${PORT}.`);
});
// module.exports = app;
