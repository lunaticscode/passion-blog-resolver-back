const express = require("express");
const { PORT } = require("./consts/app");
const cors = require("cors");
const apiController = require("./controllers");
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api", apiController);

app.listen(PORT, () => {
  console.log(`Express Running on ${PORT}.`);
});
// module.exports = app;
