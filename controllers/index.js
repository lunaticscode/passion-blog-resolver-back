const keywordController = require("./keyword.controller");

const apiController = require("express").Router();

apiController.use("/keyword", keywordController);
module.exports = apiController;
