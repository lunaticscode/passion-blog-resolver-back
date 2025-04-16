require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_KEY = "passion_ac_token";
module.exports = {
  JWT_SECRET,
  TOKEN_KEY,
};
