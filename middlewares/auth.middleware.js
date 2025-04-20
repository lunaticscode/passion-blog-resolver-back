const { TOKEN_KEY } = require("../consts/jwt");
const { getDecodedToken, getSignedToken } = require("../utils/token");

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import('express').NextFunction} next
 */
const authMiddleware = (req, res, next) => {
  const { cookies } = req;
  const token = cookies[TOKEN_KEY] || null;
  if (!token || !token.trim()) {
    return res
      .status(400)
      .json({ isError: true, message: "(!) Cannot read access token." });
  }
  const decodedToken = getDecodedToken(token);
  if (!decodedToken) {
    return res
      .status(401)
      .json({ isError: true, message: "(!) Invalid access token." });
  }
  const { email, picture, name } = decodedToken;
  const resignedToken = getSignedToken({ email, picture, name });

  req.profile = {
    email,
    picture,
    name,
  };
  res.cookie(TOKEN_KEY, resignedToken, { path: "/", httpOnly: true });
  next();
};
module.exports = authMiddleware;
