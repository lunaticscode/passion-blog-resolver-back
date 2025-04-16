const express = require("express");
const { PORT } = require("./consts/app");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors());

const apiController = require("./controllers");
app.use("/api", apiController);

app.listen(PORT, () => {
  console.log(`Express Running on ${PORT}.`);
});
// module.exports = app;
