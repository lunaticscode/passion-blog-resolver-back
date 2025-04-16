const authMiddleware = require("../middlewares/auth.middleware");
const keywordController = require("./keyword.controller");
const oauthController = require("./oauth.controller");

const apiController = require("express").Router();

apiController.get("/auth", authMiddleware, (req, res) => {
  return res.status(200).json({ isError: false, profile: req.profile });
});

apiController.use("/keyword", keywordController);
apiController.use("/oauth", oauthController);
module.exports = apiController;
