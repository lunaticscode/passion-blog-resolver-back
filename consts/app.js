require("dotenv").config();
const PORT = process.env.APP_PORT || 8080;
const GPT_API_KEY = process.env.GPT_API_KEY || "";
const CLIENT_URL = process.env.CLIENT_URL || "";
module.exports = {
  PORT,
  GPT_API_KEY,
  CLIENT_URL,
};
